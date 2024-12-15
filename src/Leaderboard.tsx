// Leaderboard.tsx
import { Devvit } from '@devvit/public-api';

export const Leaderboard = ({ onClose }: { onClose: () => void }) => {
  return (
    <vstack width="100%" height="100%">
      <spacer height="5px" />
      <hstack width="100%" alignment="middle">
        <spacer grow />
        <text wrap size="large" weight="bold">Leaderboard</text>
        <spacer grow />
        <button
          icon="close"
          onPress={onClose}
        />
        <spacer width="5px" />
      </hstack>
      <hstack alignment="middle center" width="100%" grow>

      </hstack>
    </vstack>
  );
};
