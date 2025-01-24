import { Devvit } from '@devvit/public-api';

interface StyledBoxProps {
  word: string;
  rank: number;
  guessedAt?: number;
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
    guessedAt,
    minWidth = '120px',
    maxWidth = '120px',
    height = '30px',
    borderColor = '#000000',
    
  } = props;

  const getBackgroundColor = (rank: number): string => {
    if (rank == 0) return '#d8d6c9';
    if (rank < 200) return '#60d394';
    if (rank < 1000) return '#aaf683';
    if (rank < 3000) return '#ffd97d';
    if (rank < 5000) return '#ff9b85';
    return '#ee6055';
  };

  const recentGuessBorderColor =
  guessedAt && Date.now() - guessedAt < 10000 ? '#0000FF' : borderColor;

  const recentGuessBorderWidth =
  guessedAt && Date.now() - guessedAt < 10000 ? 'thick' : 'thin';

  return (
    <hstack
      minWidth={minWidth}
      maxWidth={maxWidth}
      height={height}
      borderColor={recentGuessBorderColor}
      border={recentGuessBorderWidth}
      padding="xsmall"
      alignment="middle"
      cornerRadius = 'medium'
      backgroundColor={getBackgroundColor(rank)}
    >
      <text alignment="middle start" color='black'>{word}</text>
      <spacer grow />
      <text alignment="middle end" size="xsmall" color='black'>{rank}</text>
    </hstack>
  );
};
