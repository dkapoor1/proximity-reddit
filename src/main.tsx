// main.tsx
import { Devvit } from '@devvit/public-api';
import { StyledBox } from './StyledBox.js';

Devvit.configure({
  redis: true,
  redditAPI: true,
  realtime: true,
  http: true,
});

const App: Devvit.CustomPostComponent = ({ useState, useForm, useChannel, redis, reddit, postId, ui}) => {

  const [showInfo, setShowInfo] = useState(false);
  const [top18, setTop18] = useState<{ word: string; rank: number }[]>([]);

  async function initializeGame() {
    const currGameId = await redis.get('curr_game_id');
    if (!currGameId) {
      await redis.set('curr_game_id', '1');
    }
    await updateRankedWordList(parseInt(currGameId || '1', 10));
  }

  // Increment curr_game_id and update ranked_word_list
  async function incrementGameId() {
    const currGameId = await redis.get('curr_game_id');
    const newGameId = (parseInt(currGameId || '1', 10) + 1).toString();
    await redis.set('curr_game_id', newGameId);
    await updateRankedWordList(parseInt(newGameId, 10));
    ui.showToast({ text: `Game ID updated to ${newGameId}` });
  }

  // Fetch and update ranked_word_list from S3
  async function updateRankedWordList(gameId: number) {
    const s3Url = `https://proximity-game.s3.us-east-1.amazonaws.com/proximity_devvit_${gameId}.json`;

    try {
      // Attempt to fetch from S3
      const response = await fetch(s3Url);
      if (!response.ok) throw new Error(`Failed to fetch from S3 for Game ID ${gameId}`);
  
      const data = await response.json();
      if (data.rankings && Array.isArray(data.rankings)) {
        await redis.set('ranked_word_list', JSON.stringify(data.rankings));
        console.log(`Ranked word list updated from S3 for Game ID ${gameId}`);
      } else {
        throw new Error('Invalid word list format from S3');
      }
    } catch (s3Error) {
      console.error(`S3 fetch error: ${s3Error}`);
  
      try {
        // Attempt to load from local file
        const data = await import(`./word-lists/proximity_devvit_${gameId}.json`);
        if (data.rankings && Array.isArray(data.rankings)) {
          await redis.set('ranked_word_list', JSON.stringify(data.rankings));
          console.log(`Ranked word list updated from local file for Game ID ${gameId}`);
        } else {
          throw new Error('Invalid word list format from local file');
        }
      } catch (localError) {
        console.error(`Local fetch error: ${localError}`);
        ui.showToast({ text: `Failed to update ranked word list for Game ID ${gameId} from both S3 and local file.` });
      }
    }
  }

  const guessForm = useForm(
    {
      fields: [
        {
          type: 'string',
          name: 'guess',
          label: 'Type your guess',
          required: true,
        },
      ],
      title: 'Submit Your Guess',
      acceptLabel: 'Submit',
    },
    async (values) => {
      const guess = values.guess.trim().toLowerCase();
      if (!guess) {
        ui.showToast({ text: "You didn't enter a guess!" });
        return;
      }
      const rankedWordList: string[] = JSON.parse(
        (await redis.get('ranked_word_list')) || '[]'
      );

      const wordIndex = rankedWordList.indexOf(guess);
      if (wordIndex === -1) {
        ui.showToast({ text: `"${guess}" not found in list.` });
        return;
      } else {
        const rank = wordIndex + 1;
        ui.showToast({ text: `${guess} rank: ${rank}` });
        const top18: { word: string; rank: number }[] = JSON.parse(
          (await redis.get('top_18_guesses')) || '[]'
        );
        if (top18.length < 18) {
          top18.push({ word: guess, rank });
        } else {
          const maxRankIndex = top18.reduce(
            (maxIndex, item, index, array) =>
              item.rank > array[maxIndex].rank ? index : maxIndex,
            0
          );
          if (rank < top18[maxRankIndex].rank) {
            top18[maxRankIndex] = { word: guess, rank };
          }
        }
        top18.sort((a, b) => a.rank - b.rank);
        await redis.set('top_18_guesses', JSON.stringify(top18));
        console.log('Updated Top 18 Guesses:', top18);
      }
    }
  );

  async function showGuessForm() {
    ui.showForm(guessForm);
  }

  useState(async () => {
    await initializeGame();
    const top18Data = JSON.parse((await redis.get('top_18_guesses')) || '[]');
    setTop18(top18Data);
  });

  const renderGuesses = () => {
    const filledGuesses = Array.from({ length: 18 }, (_, index) =>
      top18[index] || { word: '', rank: '' }
    );
  
    return (
      <vstack>
        <hstack>
          <vstack>
            {filledGuesses.slice(0, 6).map((item) => (
              <StyledBox
                content={item.word ? `${item.word}: ${item.rank}` : ''}
                borderColor="#007bff"
              />
            ))}
          </vstack>
          <vstack>
            {filledGuesses.slice(6, 12).map((item) => (
              <StyledBox
                content={item.word ? `${item.word}: ${item.rank}` : ''}
                borderColor="#28a745"
              />
            ))}
          </vstack>
          <vstack>
            {filledGuesses.slice(12, 18).map((item) => (
              <StyledBox
                content={item.word ? `${item.word}: ${item.rank}` : ''}
                borderColor="#ff8800"
              />
            ))}
          </vstack>
        </hstack>
      </vstack>
    );
  };  

  if (showInfo) {
    return (
      <vstack width="100%" height="100%">
        <hstack width="100%" alignment="middle">
          <spacer grow />
          <button
            icon="close"
            width={10}
            onPress={() => setShowInfo(false)}
          />
          <spacer width="20px" />
        </hstack>
        <spacer height="20px" />
        <vstack alignment="center middle" grow>
          <text>Some informational text here.</text>
        </vstack>
      </vstack>
    );
  }

  return (
    <vstack width="100%" height="100%">
      <hstack width="100%" alignment="middle">
        <spacer grow />
        <button
          icon="info"
          onPress={() => setShowInfo(true)}
        />
        <spacer width="20px" />
      </hstack>
      <vstack alignment="center middle" grow>
          <button onPress={showGuessForm} >
            Submit Guess
          </button>
          <spacer height="10px" />
          {renderGuesses()}
      </vstack>
    </vstack>
  );
    };

Devvit.addCustomPostType({
  name: 'Proximity',
  render: App,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Proximity Game',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Proximity #1',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading a hand-crafted custom app…
          </text>
        </vstack>
      ),
    });
    ui.showToast(`Created custom post in r/${currentSubreddit.name}!`);
  },
});

export default Devvit;