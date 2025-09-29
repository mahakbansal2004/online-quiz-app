import React, { useState } from 'react';
import './StartScreen.css';

function StartScreen({ onStart }) {
  const [userName, setUserName] = useState('');

  const handleStart = () => {
    if (userName.trim()) {
      onStart(userName.trim());
    } else {
      alert('Please enter your name to start the quiz!');
    }
  };

  return (
    <div className="start-screen">
      <div className="start-container">
        <h1>Welcome to the Quiz App</h1>
        <p>Test your knowledge with 10 questions</p>
        
        <div className="username-input">
          <label htmlFor="username">Enter Your Name:</label>
          <input
            type="text"
            id="username"
            placeholder="Mahak Bansal"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
          />
        </div>

        <div className="quiz-info">
          <div className="info-item">
            <span className="icon">📝</span>
            <span>10 Questions</span>
          </div>
          <div className="info-item">
            <span className="icon">⏱️</span>
            <span>10 Minutes</span>
          </div>
          <div className="info-item">
            <span className="icon">🎯</span>
            <span>Multiple Choice</span>
          </div>
        </div>
        
        <button onClick={handleStart} className="start-button">
          Start Quiz
        </button>
      </div>
    </div>
  );
}

export default StartScreen;