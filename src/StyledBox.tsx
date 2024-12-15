import { Devvit } from '@devvit/public-api';

interface StyledBoxProps {
  word: string;
  rank: number;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  borderColor?: string;
  backgroundColor?: string;
}

export const StyledBox = (props: StyledBoxProps): JSX.Element => {
  const {
    word,
    rank,
    width = '140px',
    height = '30px',
    borderColor = '#7d79d2',
  } = props;

  return (
    <hstack
      width={width}
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
