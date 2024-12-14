import { Devvit } from '@devvit/public-api';

interface StyledBoxProps {
  content: string;
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
  borderColor?: string;
  backgroundColor?: string;
}

export const StyledBox = (props: StyledBoxProps): JSX.Element => {
  const {
    content,
    width = '140px',
    height = '30px',
    borderColor = '#000',
    backgroundColor = '#fff',
  } = props;

  return (
    <vstack
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      padding="xsmall"
      alignment="center middle"
    >
      <text>{content}</text>
    </vstack>
  );
};
