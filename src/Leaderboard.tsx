import { Devvit } from '@devvit/public-api';

export const Leaderboard = ({
    onClose,
    leaderboard,
}: {
    onClose: () => void;
    leaderboard: { username: string; solves: number }[];
}) => {
    return (
        <vstack width="100%" height="100%">
            <spacer height="5px" />
            <hstack width="100%" alignment="middle">
                <spacer width="20px" />
                <spacer grow />
                <text wrap size="large" weight="bold">
                    Leaderboard
                </text>
                <spacer grow />
                <button icon="close" onPress={onClose} />
                <spacer width="5px" />
            </hstack>
            <spacer height="10px" />
            {/* Table Headers */}
            <hstack width="100%" padding="xsmall" alignment="center middle">
                <spacer width="50px" />
                <text size="medium" weight="bold" width="20%">Rank</text>
                <text size="medium" weight="bold" width="50%">User</text>
                <text size="medium" weight="bold" width="30%">Solves</text>
            </hstack>
            {/* Rows */}
            <vstack grow width="100%">
                {leaderboard.length === 0 ? (
                    <text size="medium" weight="bold" alignment="center">
                        No data available
                    </text>
                ) : (
                    leaderboard.map((entry, index) => (
                        <hstack key={index.toString()} width="100%" padding="xsmall" alignment="center middle">
                            <spacer width="50px" />
                            <text size="medium" width="20%">{index + 1}</text>
                            <text size="medium" width="50%">{entry.username}</text>
                            <text size="medium" width="30%">{entry.solves}</text>
                        </hstack>
                    ))
                )}
            </vstack>
        </vstack>
    );
};
