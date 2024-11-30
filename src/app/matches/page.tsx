'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Team = {
  id: string;
  name: string;
  members: string[];
};

type Game = {
  team1Players: string[];
  team2Players: string[];
  score: [number, number, number]; // Scores for 3 sets
};

type Match = {
  team1: Team | null;
  team2: Team | null;
  games: Game[];
};

export default function MatchesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([
    {
      team1: null,
      team2: null,
      games: Array(8).fill({
        team1Players: ['', ''],
        team2Players: ['', ''],
        score: [0, 0, 0],
      }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const fetchedTeams: Team[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];
      setTeams(fetchedTeams);
    };
    fetchTeams();
  }, []);

  const handlePlayerSelection = (
    matchIndex: number,
    gameIndex: number,
    team: number,
    playerIndex: number,
    value: string
  ) => {
    const updatedMatches = [...matches];
    if (team === 1) {
      updatedMatches[matchIndex].games[gameIndex].team1Players[playerIndex] = value;
    } else {
      updatedMatches[matchIndex].games[gameIndex].team2Players[playerIndex] = value;
    }
    setMatches(updatedMatches);
  };

  const handleScoreInput = (
    matchIndex: number,
    gameIndex: number,
    setIndex: number,
    value: number
  ) => {
    const updatedMatches = [...matches];
    updatedMatches[matchIndex].games[gameIndex].score[setIndex] = value;
    setMatches(updatedMatches);
  };

  const determineWinner = (match: Match) => {
    const setsWon = [0, 0]; // [Team1, Team2]
    const points = [0, 0]; // Total points won by each team
  
    match.games.forEach(({ score }) => {
      const [team1SetScore, team2SetScore] = score;
  
      // Determine set winner
      if (team1SetScore > team2SetScore) setsWon[0]++;
      else if (team2SetScore > team1SetScore) setsWon[1]++;
  
      // Add points for ratio calculation
      points[0] += team1SetScore;
      points[1] += team2SetScore;
    });
  
    const winner =
      setsWon[0] > setsWon[1] ? match.team1?.name || "Team 1" : match.team2?.name || "Team 2";
  
    return {
      winner,
      setsWon,
      points,
    };
  };

  const addMatch = () => {
    setMatches((prev) => [
      ...prev,
      {
        team1: null,
        team2: null,
        games: Array(8).fill({
          team1Players: ['', ''],
          team2Players: ['', ''],
          score: [0, 0, 0],
        }),
      },
    ]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Schedule Matches</h1>

      {matches.map((match, matchIndex) => (
        <div key={matchIndex} className="mt-6 space-y-4 border p-4 rounded">
          <h2 className="text-xl font-bold">Match {matchIndex + 1}</h2>

          {/* Team Selection */}
          <div className="space-y-2">
            <select
              value={match.team1?.id || ''}
              onChange={(e) =>
                setMatches((prev) =>
                  prev.map((m, i) =>
                    i === matchIndex
                      ? {
                          ...m,
                          team1: teams.find((team) => team.id === e.target.value) || null,
                        }
                      : m
                  )
                )
              }
              className="border p-2 w-full"
            >
              <option value="">Select Team 1</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={match.team2?.id || ''}
              onChange={(e) =>
                setMatches((prev) =>
                  prev.map((m, i) =>
                    i === matchIndex
                      ? {
                          ...m,
                          team2: teams.find((team) => team.id === e.target.value) || null,
                        }
                      : m
                  )
                )
              }
              className="border p-2 w-full"
            >
              <option value="">Select Team 2</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Games */}
          {match.games.map((game, gameIndex) => (
            <div key={gameIndex} className="space-y-2 mt-4">
              <h3 className="font-bold">Game {gameIndex + 1}</h3>
              <div className="flex space-x-4">
                {game.team1Players.map((_, playerIndex) => (
                  <select
                    key={`match-${matchIndex}-game-${gameIndex}-team1-player-${playerIndex}`}
                    onChange={(e) =>
                      handlePlayerSelection(
                        matchIndex,
                        gameIndex,
                        1,
                        playerIndex,
                        e.target.value
                      )
                    }
                    className="border p-2 w-full"
                  >
                    <option value="">Select Team 1 Player {playerIndex + 1}</option>
                    {match.team1?.members.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                ))}

                {game.team2Players.map((_, playerIndex) => (
                  <select
                    key={`match-${matchIndex}-game-${gameIndex}-team2-player-${playerIndex}`}
                    onChange={(e) =>
                      handlePlayerSelection(
                        matchIndex,
                        gameIndex,
                        2,
                        playerIndex,
                        e.target.value
                      )
                    }
                    className="border p-2 w-full"
                  >
                    <option value="">Select Team 2 Player {playerIndex + 1}</option>
                    {match.team2?.members.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                ))}
              </div>

              {/* Scores */}
              <div className="flex space-x-4">
                {[0, 1, 2].map((setIndex) => (
                  <div key={setIndex} className="flex flex-col items-center">
                    <span>Set {setIndex + 1}</span>
                    <input
                      type="number"
                      placeholder="Team 1"
                      onChange={(e) =>
                        handleScoreInput(
                          matchIndex,
                          gameIndex,
                          setIndex,
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border p-2 w-16"
                    />
                    <input
                      type="number"
                      placeholder="Team 2"
                      onChange={(e) =>
                        handleScoreInput(
                          matchIndex,
                          gameIndex,
                          setIndex,
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border p-2 w-16"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Save Match Button */}
          <button
            onClick={async () => {
              try {
                setLoading(true);

                const winnerData = determineWinner(match);
                const matchData = {
                  team1: match.team1?.name || null,
                  team2: match.team2?.name || null,
                  games: match.games,
                  winner: winnerData.winner,
                  setsWon: winnerData.setsWon,
                  points: winnerData.points,
                };

                await addDoc(collection(db, 'matches'), matchData);

                alert(`Match ${matchIndex + 1} saved successfully!`);
              } catch (error) {
                console.error(`Error saving Match ${matchIndex + 1}:`, error);
                alert(`Failed to save Match ${matchIndex + 1}.`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded ${
              loading ? 'bg-gray-400' : 'bg-green-500 text-white'
            }`}
          >
            {loading ? 'Saving...' : `Save Match ${matchIndex + 1}`}
          </button>
        </div>
      ))}

      {/* Add Match Button */}
      <button
        onClick={addMatch}
        className="mt-6 px-4 py-2 rounded bg-blue-500 text-white"
      >
        Add Match
      </button>
    </div>
  );
}
