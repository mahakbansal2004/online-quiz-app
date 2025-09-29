import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

function Leaderboard({ onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h2>🏆 Leaderboard - Top 10</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>No quiz attempts yet. Be the first!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div key={index} className={`leaderboard-item rank-${index + 1}`}>
                <span className="rank">{getMedal(index + 1)}</span>
                <div className="user-info">
                  <span className="user-name">{entry.user_name}</span>
                  <span className="timestamp">{formatDate(entry.timestamp)}</span>
                </div>
                <div className="score-info">
                  <span className="score">{entry.score}/{entry.total_questions}</span>
                  <span className="percentage">{entry.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;