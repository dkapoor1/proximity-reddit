import { Devvit } from '@devvit/public-api';
  
Devvit.addTrigger({
    event: 'AppInstall',
    onEvent: async (_, { reddit }) => {
      const currentSubreddit = await reddit.getCurrentSubreddit();
      await reddit.submitPost({
        title: 'Proximity #1',
        subredditName: currentSubreddit.name,
        preview: (
          <vstack padding="medium" cornerRadius="medium">
            <text style="heading" size="medium">
              Loading Proximity, a global word guessing game…
            </text>
          </vstack>
        ),
      });
    },
});

Devvit.addMenuItem({
    location: 'subreddit',
    label: 'Proximity Game',
    onPress: async (_, context) => {
      const { redis, ui, scheduler } = context;
      const existingJobId = await redis.get('CheckPostCreationJobId');
      if (!existingJobId) {
        const newJobId = await scheduler.runJob({
          name: 'CheckPostCreation',
          cron: '*/10 * * * *',
        });
        await redis.set('CheckPostCreationJobId', newJobId);
      } else {
        console.log("CheckPostCreation job is already running")
      }
      ui.showToast('Sort subreddit by new to see the latest game!');
    },
});

Devvit.addSchedulerJob({
    name: 'CheckPostCreation',
    onRun: async (_, context) => {
      const redis = context.redis;
      const reddit = context.reddit;
      const isPending = await redis.get('post_creation_pending');
      console.log("checking post_creation_pending")
      if (isPending === 'true') {
        console.log("isPending true")
        const newGameId = (parseInt(await redis.get('curr_game_id') || '1', 10)).toString();
        const currentSubreddit = await reddit.getCurrentSubreddit();
        await reddit.submitPost({
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
        await redis.set('post_creation_pending', 'false');
      }
    },
});