// HowToPlay.tsx
import { Devvit } from '@devvit/public-api';

export const HowToPlay = ({ onClose }: { onClose: () => void }) => {
  return (
    <vstack width="100%" height="100%" backgroundColor="#d8d6c9">
      <spacer height="5px" />
      <hstack width="100%" alignment="middle">
        <spacer grow />
        <text wrap size="large" weight="bold">Can you guess the secret word?</text>
        <spacer grow />
        <button
          icon="close"
          onPress={onClose}
        />
        <spacer width="5px" />
      </hstack>
      <hstack alignment="middle center" width="100%" grow>
        <hstack width="5%" />
        <vstack alignment="middle start" grow width="90%">
          <text wrap size="medium">
            • This game is not about spelling or sound; it's about meaning. Words are sorted by artificial intelligence based on their contextual similarity to the secret word.
          </text>
          <spacer height="5px" />
          <text wrap size="medium">
            • After making each guess, you will see its closeness to the secret word. The lower the number, the better. The best 18 guesses from players around the world are shown in real-time.
          </text>
          <spacer height="5px" />
          <text wrap size="medium">• The secret word is ranked #1. Try to guess it before anyone else!</text>
        </vstack>
        <hstack width="5%" />
      </hstack>
    </vstack>
  );
};
