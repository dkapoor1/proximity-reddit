import { Devvit } from '@devvit/public-api';
  
Devvit.addMenuItem({
    location: 'subreddit',
    label: 'Proximity Game',
    onPress: async (_, context) => {
        const { reddit, ui } = context;
        // const currentSubreddit = await reddit.getCurrentSubreddit();
        // await reddit.submitPost({
        // title: 'Proximity #1',
        // subredditName: currentSubreddit.name,
        // preview: (
        //     <vstack padding="medium" cornerRadius="medium">
        //     <text style="heading" size="medium">
        //         Loading Proximity, a global word guessing game…
        //     </text>
        //     </vstack>
        // ),
        // });
        ui.showToast(`Sort subreddit by new to see the latest game!`);
    },
});