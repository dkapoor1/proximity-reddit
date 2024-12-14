// main.tsx
import { Devvit } from '@devvit/public-api';
import { StyledBox } from './StyledBox.js';

Devvit.configure({
  redis: true,
  redditAPI: true,
  realtime: true,
});

const App: Devvit.CustomPostComponent = ({ useState, useForm, useChannel, redis, reddit, postId, ui}) => {

  const [showInfo, setShowInfo] = useState(false);
  const [guesses, setGuesses] = useState<string[]>([]);

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
      const guess = values.guess;
      if (!guess) {
        ui.showToast({ text: "You didn't enter a guess!" });
        return;
      }

      const storedGuesses: string[] = JSON.parse((await redis.get(`guesses:${postId}`)) || '[]');
      const updatedGuesses = [...storedGuesses, guess];
      await redis.set(`guesses:${postId}`, JSON.stringify(updatedGuesses));
      setGuesses(updatedGuesses);
      console.log('Updated Guesses:', updatedGuesses);
      ui.showToast({ text: 'Guess submitted!' });
    }
  );

  async function showGuessForm() {
    ui.showForm(guessForm);
    const storedGuesses: string[] = JSON.parse((await redis.get(`guesses:${postId}`)) || '[]');
    setGuesses(storedGuesses);
  }

  useState(async () => {
    const storedGuesses: string[] = JSON.parse((await redis.get(`guesses:${postId}`)) || '[]');
    setGuesses(storedGuesses);
  });

  const renderGuesses = () => {
    const recentGuesses = guesses.slice(-18); // Last 18 guesses
    const filledGuesses = Array.from({ length: 18 }, (_, index) => recentGuesses[index] || '');
  
    return (
      <vstack>
        <hstack>
          <vstack>
            {filledGuesses.slice(0, 6).map((guess, index) => (
              <StyledBox
                content={guess ? `${index + 1}. ${guess}` : ''}
                borderColor="#007bff"
              />
            ))}
          </vstack>
          <vstack>
            {filledGuesses.slice(6, 12).map((guess, index) => (
              <StyledBox
                content={guess ? `${6 + index + 1}. ${guess}` : ''}
                borderColor="#28a745"
              />
            ))}
          </vstack>
          <vstack>
            {filledGuesses.slice(12, 18).map((guess, index) => (
              <StyledBox
                content={guess ? `${12 + index + 1}. ${guess}` : ''}
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