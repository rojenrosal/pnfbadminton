'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Team = {
  name: string;
  wins: number;
  gamesWon: number;
  headToHeadWins?: number;
  setsWon?: number;
  pointsRatio?: number;
};

type Game = {
  team1Points: number;
  team2Points: number;
  team1Sets: number;
  team2Sets: number;
  winner: string;
};

type Match = {
  team1: string;
  team2: string;
  games: Game[];
  winner: string;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Team[]>([]);
  const [deleteCode, setDeleteCode] = useState<string>(''); // State for input code
  const [error, setError] = useState<string>(''); // State for error message

  useEffect(() => {
    const fetchMatches = async () => {
      const querySnapshot = await getDocs(collection(db, 'matches'));
      const fetchedMatches: Match[] = querySnapshot.docs.map((doc) => doc.data() as Match);

      const teamStats: Record<string, Team> = {};

      // Calculate stats
      fetchedMatches.forEach((match) => {
        const { team1, team2, games, winner } = match;

        if (!teamStats[team1]) {
          teamStats[team1] = { name: team1, wins: 0, gamesWon: 0, headToHeadWins: 0, setsWon: 0, pointsRatio: 0 };
        }
        if (!teamStats[team2]) {
          teamStats[team2] = { name: team2, wins: 0, gamesWon: 0, headToHeadWins: 0, setsWon: 0, pointsRatio: 0 };
        }

        if (winner) {
          teamStats[winner].wins += 1;
        }

        games.forEach((game) => {
          if (game.winner === team1) {
            teamStats[team1].headToHeadWins! += 1;
            teamStats[team1].gamesWon += 1;
          } else if (game.winner === team2) {
            teamStats[team2].headToHeadWins! += 1;
            teamStats[team2].gamesWon += 1;
          }
        });
      });

      // Convert stats to leaderboard array
      const leaderboardData = Object.values(teamStats).sort((a, b) => b.wins - a.wins);
      setLeaderboard(leaderboardData);
    };

    fetchMatches();
  }, []);

  const handleDeleteMatches = async () => {
    if (deleteCode === 'deletethis') {
      try {
        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        matchesSnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'matches', docSnapshot.id)); // Delete each match
        });
        setLeaderboard([]); // Clear leaderboard after deletion
        setError(''); // Reset any error messages
      } catch (error) {
        setError('Failed to delete matches.');
      }
    } else {
      setError('The code is incorrect.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="mt-4">
        {leaderboard.length > 0 ? (
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Rank</th>
                <th className="border px-4 py-2">Team</th>
                <th className="border px-4 py-2">Wins</th>
                <th className="border px-4 py-2">Games Won</th>
                <th className="border px-4 py-2">Head-to-Head Wins</th>
                <th className="border px-4 py-2">Sets Won</th>
                <th className="border px-4 py-2">Points Ratio</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, index) => (
                <tr key={team.name}>
                  <td className="border px-4 py-2 text-center">{index + 1}</td>
                  <td className="border px-4 py-2">{team.name}</td>
                  <td className="border px-4 py-2 text-center">{team.wins}</td>
                  <td className="border px-4 py-2 text-center">{team.gamesWon}</td>
                  <td className="border px-4 py-2 text-center">{team.headToHeadWins}</td>
                  <td className="border px-4 py-2 text-center">{team.setsWon}</td>
                  <td className="border px-4 py-2 text-center">
                    {team.pointsRatio!.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No match data available yet.</p>
        )}
      </div>

      <div className="mt-6">
        <input
          type="text"
          value={deleteCode}
          onChange={(e) => setDeleteCode(e.target.value)}
          className="border p-2"
          placeholder="Enter code to delete matches"
        />
        <button
          onClick={handleDeleteMatches}
          className="ml-2 bg-red-500 text-white p-2"
        >
          Delete All Matches
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
