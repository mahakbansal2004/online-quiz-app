import { useState, useEffect } from 'react';
import './App.css';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import Leaderboard from './components/Leaderboard';

function App() {
  const [screen, setScreen] = useState('start');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timerActive) {
      handleSubmit();
    }
  }, [timeLeft, timerActive]);

  const startQuiz = async (name) => {
    setUserName(name);
    try {
      const response = await fetch('http://localhost:5000/api/questions');
      const data = await response.json();
      setQuestions(data.questions);
      setScreen('quiz');
      setTimerActive(true);
    } catch (error) {
      alert('Failed to load questions. Please make sure backend is running.');
      console.error(error);
    }
  };

  const handleAnswer = (questionId, option) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          answers: userAnswers,
          userName: userName 
        })
      });
      const data = await response.json();
      setResult(data);
      setScreen('result');
    } catch (error) {
      alert('Failed to submit quiz. Please try again.');
      console.error(error);
    }
  };

  const restartQuiz = () => {
    setScreen('start');
    setCurrentIndex(0);
    setUserAnswers({});
    setResult(null);
    setTimeLeft(600);
    setTimerActive(false);
    setUserName('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {screen === 'start' && (
        <>
          <StartScreen onStart={startQuiz} />
          <button 
            className="leaderboard-toggle"
            onClick={() => setShowLeaderboard(true)}
          >
            🏆 Leaderboard
          </button>
        </>
      )}
      
      {screen === 'quiz' && questions[currentIndex] && (
        <QuizScreen
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          userAnswer={userAnswers[questions[currentIndex]?.id]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          timeLeft={formatTime(timeLeft)}
        />
      )}
      
      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          questions={questions}
          userName={userName}
          onRestart={restartQuiz}
          onViewLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </>
  );
}

export default App;