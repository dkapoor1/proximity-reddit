// main.tsx
import { Devvit, useInterval } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';
import { StyledBox } from './StyledBox.js';
import { HowToPlay } from './HowToPlay.js';
import { Leaderboard } from './Leaderboard.js';
import './MenuItem.tsx';

Devvit.configure({
  redis: true,
  redditAPI: true,
  realtime: true,
  http: true,
});

type RealtimeMessage = {
  top18: { word: string; rank: number; guessedAt?: number }[];
  session: string;
  gameHistory?: {
    solved_by: string;
    target_word: string;
    top_18: { word: string; rank: number; guessedAt?: number }[];
  };
  currGameId?: string;
  toastMessage?: string;
};

function sessionId(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

const App: Devvit.CustomPostComponent = ({ useState, useForm, useChannel, redis, reddit, postId, ui}) => {
  const mySession = sessionId();
  const [showInfo, setShowInfo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [top18, setTop18] = useState<{ word: string; rank: number; guessedAt?: number }[]>(async () => {
    const data = JSON.parse((await redis.get('top_18_guesses')) || '[]');
    return data;
  });

  const [currentTitle, setCurrentTitle] = useState<string>(async () => {
    if (!postId) return '';
    const post = await reddit.getPostById(postId);
    return post.title || '';
  });

  const [currGameIdState, setCurrGameIdState] = useState<string>('1');

  const [gameHistory, setGameHistory] = useState<{
    solved_by?: string;
    target_word?: string;
    top_18?: { word: string; rank: number; guessedAt?: number }[];
  }>({ target_word: '', solved_by: '', top_18: [] });

  const [currentUsername] = useState(async () => {
    const currentUser = await reddit.getCurrentUser();
    return currentUser?.username || 'anonymous'; 
  });  

  const [disableGuessButton, setDisableGuessButton] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [activeGameUrl, setActiveGameUrl] = useState('');
  
  const top18Channel = useChannel<RealtimeMessage>({
    name: 'top18_state',
    onMessage: (msg) => {
      if (msg.session !== mySession && msg.currGameId === currGameIdState) {
        setTop18(msg.top18);
        if (msg.gameHistory) {
          setGameHistory(msg.gameHistory);
        }
        if (msg.currGameId) {
          setCurrGameIdState(msg.currGameId);
        }
        if (msg.toastMessage) {
          ui.showToast({ text: msg.toastMessage });
        }
      }
    },
    onSubscribed: async () => {
      console.log('Subscribed to game state updates');
    },
  });
  top18Channel.subscribe();  

  useState(async () => {
    const storedUrl = await redis.get('active_game');
    console.log(storedUrl)
    if (storedUrl) {
      setActiveGameUrl(storedUrl);
    }
  });

  async function loadSolvedGameHistory(currentTitleId: string) {
    const solvedGameHistory = JSON.parse(
      (await redis.get(`game_history_${currentTitleId}`)) || '{}'
    );
    setGameHistory(solvedGameHistory);
    const currentGameId = await redis.get('curr_game_id');
    setCurrGameIdState(currentGameId as string);
  }

  async function initializeGame() {
    const currGameId = await redis.get('curr_game_id');
    setCurrGameIdState(currGameId || '1');
    if (!currGameId) {
      await redis.set('curr_game_id', '1');
    }

    const rankedWordList = await redis.get('ranked_word_list');
    if (!rankedWordList || JSON.parse(rankedWordList).length === 0) {
      console.log('ranked_word_list is empty or null. Triggering update.');
      await updateRankedWordList(parseInt(currGameId || '1', 10));
    }
    
    // const postFlagKey = 'post_292_created';
    // const hasPostBeenCreated = await redis.get(postFlagKey);
    // if (!hasPostBeenCreated) {
    //   await redis.del('top_18_guesses'); // Clear top 18 guesses
    //   const currentSubreddit = await reddit.getCurrentSubreddit();
    //   // Submit the post
    //   await reddit.submitPost({
    //     title: `Proximity #292`,
    //     subredditName: currentSubreddit.name,
    //     preview: (
    //       <vstack padding="medium" cornerRadius="medium">
    //         <text style="heading" size="medium">
    //           Loading Proximity, a global word guessing game…
    //         </text>
    //       </vstack>
    //     ),
    //   });
    //   // Set the flag in Redis to ensure this post is only created once
    //   await redis.set(postFlagKey, 'true');
    //   console.log('Proximity post created successfully.');
    // } else {
    //   console.log('Proximity post already exists.');
    // }
  
  }

  async function updateRankedWordList(gameId: number) {
      const s3Url = `https://proximity-game.s3.us-east-1.amazonaws.com/proximity_devvit_${gameId}.json`;
      try {
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
      }
  }

  const handleGameSolve = async (
    rankedWordList: string[],
    currGameId: string,
    top18Stored: { word: string; rank: number; guessedAt?: number }[],
  ) => {
    const gameHistory = {
      solved_by: currentUsername,
      target_word: rankedWordList[0],
      top_18: top18Stored,
    };

    await redis.set(`game_history_${currGameId}`, JSON.stringify(gameHistory));
    setGameHistory(gameHistory);
    const newGameId = (parseInt(currGameId || '1', 10) + 1).toString();
    await redis.set('curr_game_id', newGameId);
    await updateRankedWordList(parseInt(newGameId, 10));

    await redis.del('top_18_guesses');
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await redis.set('post_creation_pending', 'true');
    const newPost = await reddit.submitPost({
      title: `Proximity #${newGameId}`,
      subredditName: currentSubreddit.name,
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading Proximity, a global word guessing game…
          </text>
        </vstack>
      ),
    });
    const historyComment = await reddit.submitComment({
      id: newPost.id,
      text: "r/playproximity is an interactive post built with Reddit's developer platform. Check replies to this comment to see how our users guessed the secret word!",
    });
    if (historyComment?.id) {
      await redis.set(`history_comment`, historyComment.id);
    }
    await redis.set('active_game', newPost.url);
    await redis.set('post_creation_pending', 'false');
    await redis.set('game_created_at', Date.now().toString());
    setCurrGameIdState(newGameId);

    await top18Channel.send({
      session: mySession,
      top18: [],
      gameHistory,
      currGameId: newGameId,
      toastMessage: `Proximity #${currGameId} solved by u/${currentUsername}`,
    });
    const leaderboardKey = 'leaderboard';
    await redis.hincrby(leaderboardKey, currentUsername, 1);
    ui.showToast({ text: `Congratulations! You've guessed the secret word.` });

    const updatedScoreString = await redis.hGet(leaderboardKey, currentUsername || '');
    const updatedScore = updatedScoreString ? parseInt(updatedScoreString, 10) : 0;
    
    let flairText = '';
    if (updatedScore >= 100) {
      flairText = '100+ Solved';
    } else if (updatedScore >= 10) {
      flairText = '10+ Solved';
    } else if (updatedScore >= 1) {
      flairText = 'Solver';
    }
    
    await reddit.setUserFlair({
      subredditName: currentSubreddit.name,
      username: currentUsername,
      text: flairText,
    });
    
    return;
  };

  const { start, stop } = useInterval(() => {
    setCountdown((prev) => {
      if (prev === 1) {
        stop();
        setDisableGuessButton(false);
        return 5;
      }
      return prev - 1;
    });
  }, 1000);

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
      title: 'Submit Your Guess - top guesses will be posted as comments',
      acceptLabel: 'Submit',
    },
    async (values) => {
      const guess = values.guess.trim().toLowerCase();
      if (!guess) {
        ui.showToast({ text: "You didn't enter a guess!" });
        return;
      }
      const currentTitleIdMatch = currentTitle.match(/Proximity #(\d+)/);
      const currentTitleId = currentTitleIdMatch ? currentTitleIdMatch[1] : '';
      const currGameId = await redis.get('curr_game_id');
      if (currentTitleId !== currGameId) {
        ui.showToast({
            text: `This game has already been solved.`,
        });
        await loadSolvedGameHistory(currentTitleId);
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
        const top18Stored: { word: string; rank: number; guessedAt?: number }[] = JSON.parse(
          (await redis.get('top_18_guesses')) || '[]'
        );
        const storedHistoryCommentId = (await redis.get(`history_comment`)) || "";
        if (rank === 1) {
          await reddit.submitComment({
            id: storedHistoryCommentId,
            text: `${currentUsername} guessed **${guess} - ${rank}**`,
          });
          handleGameSolve(rankedWordList, currGameId, top18Stored)
        }

        if (!top18Stored.some(item => item.word === guess)) {
          if (top18Stored.length < 18) {
            top18Stored.push({ word: guess, rank, guessedAt: Date.now() });
          } else {
            const maxRankIndex = top18Stored.reduce(
              (maxIndex, item, index, array) =>
                item.rank > array[maxIndex].rank ? index : maxIndex,
              0
            );
            if (rank < top18Stored[maxRankIndex].rank) {
              top18Stored[maxRankIndex] = { word: guess, rank, guessedAt: Date.now() };
            }
          }
          top18Stored.sort((a, b) => a.rank - b.rank);
          await redis.set('top_18_guesses', JSON.stringify(top18Stored));
          setTop18(top18Stored);
          await top18Channel.send({ top18: top18Stored, session: mySession, currGameId: currGameId });
          if (top18Stored[0].word === guess) {
            console.log(storedHistoryCommentId)
            await reddit.submitComment({
              id: storedHistoryCommentId,
              text: `${currentUsername} guessed **${guess} - ${rank}**`,
            });
          }
          console.log('Updated Top 18 Guesses:', top18Stored);
        } else {
          ui.showToast({ text: `"${guess}" is already in the Top 18.` });
        }
      }
      setDisableGuessButton(true);
      setCountdown(5);
      start();
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

  useState(async () => {
    const currentTitleIdMatch = currentTitle.match(/Proximity #(\d+)/);
    const currentTitleId = currentTitleIdMatch ? currentTitleIdMatch[1] : '';
    if (!currentTitle.includes(`Proximity #${currGameIdState}`) && currentTitleId) {
      await loadSolvedGameHistory(currentTitleId);
    }
  });

  const renderGuesses = (guesses: { word: string; rank: number; guessedAt?: number }[]) => {
    const filledGuesses = Array.from({ length: 18 }, (_, index) =>
      guesses[index] || { word: '', rank: '' }
    );
  
    return (
        <hstack>
          <vstack gap="small">
            {filledGuesses.slice(0, 6).map((item) => (
              <StyledBox word={item.word} rank={item.rank} guessedAt={item.guessedAt} />
            ))}
          </vstack>
          <spacer width="8px" />
          <vstack gap="small">
            {filledGuesses.slice(6, 12).map((item) => (
              <StyledBox word={item.word} rank={item.rank} guessedAt={item.guessedAt} />
            ))}
          </vstack>
          <spacer width="8px" />
          <vstack gap="small">
            {filledGuesses.slice(12, 18).map((item) => (
              <StyledBox word={item.word} rank={item.rank} guessedAt={item.guessedAt} />
            ))}
          </vstack>
        </hstack>
    );
  };  

  if (showInfo) {
    return (
      <HowToPlay onClose={() => setShowInfo(false)} />
    );
  }

  if (showLeaderboard) {
    const [leaderboardData, setLeaderboardData] = useState<{ username: string; solves: number }[] | null>(null);
  
    useState(async () => {
      try {
        const leaderboardKey = 'leaderboard';
        const rawData = await redis.hgetall(leaderboardKey);  
        if (rawData) {
          const sortedData = Object.entries(rawData)
            .map(([username, solves]) => ({
              username,
              solves: parseInt(solves as string, 10),
            }))
            .sort((a, b) => b.solves - a.solves)
            .slice(0, 8);
          setLeaderboardData(sortedData);
        } else {
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboardData([]);
      }
    });
  
    if (leaderboardData === null) {
      return (
        <vstack width="100%" height="100%" alignment="center middle">
          <text size="medium" weight="bold">Loading...</text>
        </vstack>
      );
    }
  
    return (
      <Leaderboard
        onClose={() => setShowLeaderboard(false)}
        leaderboard={leaderboardData}
      />
    );
  }  

  return (
    <vstack width="100%" height="100%" backgroundColor="#d8d6c9">
      <spacer height="10px" />
      <hstack width="100%" alignment="middle">
        <spacer width="10px" />
          <button appearance='media'
            icon="world"
            onPress={() => setShowLeaderboard(true)}
          />
        <spacer grow />
        {!gameHistory.solved_by ? (
          <button
            appearance='primary'
            disabled={disableGuessButton}
            onPress={!disableGuessButton ? showGuessForm : undefined}
          >
            {disableGuessButton ? `Wait ${countdown}s` : 'Submit Guess'}
          </button>
        ) : (
          <vstack>
            <vstack>
              <hstack>
                <text color='black'>Secret Word:</text>
                <spacer width="5px" />
                <text weight="bold" color='black'>{gameHistory.target_word ?? ''}</text>
              </hstack>
            </vstack>
            <vstack>
              <hstack>
                <text color='black'>Guessed by</text>
                <spacer width="5px" />
                <text weight="bold" color='black'>u/{gameHistory.solved_by ?? ''}</text>
              </hstack>
            </vstack>
          </vstack>
        )}
        <spacer grow />
        <button appearance='media'
          icon="info"
          onPress={() => setShowInfo(true)}
        />
        <spacer width="10px" />
      </hstack>
      <vstack alignment="center bottom" grow>
        {gameHistory.solved_by && activeGameUrl ? (
            <button appearance='primary' size='small' onPress={() => ui.navigateTo(activeGameUrl)}>
              Go To Active Game
            </button>
          ) : (
            <text weight="bold" color='black'>Top 18 Guesses (word, rank)</text>
        )}
      </vstack>
      <vstack alignment="center middle" grow>
        <spacer height="10px" />
          {currentTitle.includes(`Proximity #${currGameIdState}`)
          ? renderGuesses(top18)
          : renderGuesses(gameHistory.top_18 || [])
        }
      </vstack>
    </vstack>
  );
};

Devvit.addCustomPostType({
  name: 'Proximity',
  render: App,
});

export default Devvit;