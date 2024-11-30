'use client';

import { useState } from 'react';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TeamsPage() {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!teamName || !members) {
      alert('Please provide both team name and members.');
      return;
    }

    const teamData = {
      name: teamName,
      members: members.split(',').map((member) => member.trim()),
    };

    try {
      setLoading(true);
      await addDoc(collection(db, 'teams'), teamData);
      alert(`Team ${teamName} with members ${teamData.members.join(', ')} registered!`);
      setTeamName('');
      setMembers('');
    } catch (error) {
      console.error('Error saving team data:', error);
      alert('Failed to register the team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Register a Team</h1>
      <div className="mt-4 space-y-2">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border p-2 w-full"
          disabled={loading}
        />
        <textarea
          placeholder="Team Members (comma-separated)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          className="border p-2 w-full"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded ${
            loading ? 'bg-gray-400' : 'bg-pink-500 text-white'
          }`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Team'}
        </button>
      </div>
    </div>
  );
}
