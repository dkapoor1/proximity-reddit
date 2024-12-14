// HowToPlay.tsx
import { Devvit } from '@devvit/public-api';

export const HowToPlay = ({ onClose }: { onClose: () => void }) => {
  return (
    <vstack width="100%" height="100%">
      <hstack width="100%" alignment="middle">
        <spacer grow />
        <button
          icon="close"
          onPress={onClose}
        />
        <spacer width="20px" />
      </hstack>
      <vstack alignment="center top" grow width="90%">
        <text wrap size="large" weight="bold">Can you find the secret word?</text>
      </vstack>
      <hstack alignment="middle center" width="100%" grow>
        <hstack width="5%" />
        <vstack alignment="middle start" grow width="90%">
          <text wrap size="medium">
            • Try to guess the secret word. You have unlimited guesses.
          </text>
          <spacer height="5px" />
          <text wrap size="medium">
            • This game is not about spelling or sound; it's about meaning. Words are sorted by artificial intelligence based on their contextual similarity to the secret word.
          </text>
          <spacer height="5px" />
          <text wrap size="medium">
            • After making each guess, you will see its closeness to the secret word. The lower the number, the better.
          </text>
          <spacer height="5px" />
          <text wrap size="medium">• The secret word is ranked #1!</text>
          <spacer height="5px" />
          <text wrap size="medium">
            • The AI combed through billions of lines of text. It determined the similarity of words based on the context in which they were used.
          </text>
        </vstack>
        <hstack width="5%" />
      </hstack>
    </vstack>
  );
};
