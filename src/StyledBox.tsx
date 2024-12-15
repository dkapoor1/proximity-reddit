import { Devvit } from '@devvit/public-api';

interface StyledBoxProps {
  word: string;
  rank: number;
  minWidth?: Devvit.Blocks.SizeString;
  maxWidth?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  borderColor?: string;
  backgroundColor?: string;
}

export const StyledBox = (props: StyledBoxProps): JSX.Element => {
  const {
    word,
    rank,
    minWidth = '80px',
    maxWidth = '130px',
    height = '30px',
    borderColor = '#7d79d2',
  } = props;

  return (
    <hstack
      minWidth={minWidth}
      maxWidth={maxWidth}
      height={height}
      borderColor={borderColor}
      padding="xsmall"
      alignment="middle"
    >
      <text alignment="middle start">{word}</text>
      <spacer grow />
      <text alignment="middle end" size="xsmall">{rank}</text>
    </hstack>
  );
};
