import { Devvit } from '@devvit/public-api';

export const Leaderboard = ({
    onClose,
    leaderboard,
}: {
    onClose: () => void;
    leaderboard: { username: string; solves: number }[];
}) => {
    return (
        <vstack width="100%" height="100%" backgroundColor="#d8d6c9">
            <spacer height="10px" />
            <hstack width="100%" alignment="middle">
                <spacer width="20px" />
                <spacer grow />
                <text wrap size="large" weight="bold" color='black'>
                    Leaderboard
                </text>
                <spacer grow />
                <button appearance='media' icon="close" onPress={onClose} />
                <spacer width="10px" />
            </hstack>
            <spacer height="10px" />
            {/* Table Headers */}
            <hstack width="100%" padding="xsmall" alignment="center middle">
                <spacer width="50px" />
                <text size="medium" weight="bold" width="20%" color='black'>Rank</text>
                <text size="medium" weight="bold" width="50%" color='black'>User</text>
                <text size="medium" weight="bold" width="30%" color='black'>Solves</text>
            </hstack>
            {/* Rows */}
            <vstack grow width="100%">
                {leaderboard.length === 0 ? (
                    <text size="medium" weight="bold" alignment="center" color='black'>
                        No data available
                    </text>
                ) : (
                    leaderboard.map((entry, index) => (
                        <hstack key={index.toString()} width="100%" padding="xsmall" alignment="center middle">
                            <spacer width="50px" />
                            <text size="medium" width="20%" color='black'>{index + 1}</text>
                            <text size="medium" width="50%" color='black'>{entry.username}</text>
                            <text size="medium" width="30%" color='black'>{entry.solves}</text>
                        </hstack>
                    ))
                )}
            </vstack>
        </vstack>
    );
};
