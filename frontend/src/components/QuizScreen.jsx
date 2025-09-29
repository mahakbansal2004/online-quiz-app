import React from 'react';
import './QuizScreen.css';

function QuizScreen({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  onAnswer,
  onNext,
  onPrevious,
  onSubmit,
  timeLeft
}) {
  const options = ['a', 'b', 'c', 'd'];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <div className="quiz-meta">
          <span className="question-count">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="timer">{timeLeft}</span>
        </div>
      </div>

      <div className="quiz-content">
        <h2 className="question-text">{question?.question_text}</h2>
        
        <div className="options-container">
          {options.map(option => {
            const optionKey = `option_${option}`;
            const optionText = question[optionKey];
            const isSelected = userAnswer === option;

            return (
              <button
                key={option}
                className={`option-button ${isSelected ? 'selected' : ''}`}
                onClick={() => onAnswer(question.id, option)}
              >
                <span className="option-label">{option.toUpperCase()}</span>
                <span className="option-text">{optionText}</span>
              </button>
            );
          })}
        </div>

        <div className="navigation-buttons">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="nav-button"
          >
            Previous
          </button>
          
          {isLastQuestion ? (
            <button onClick={onSubmit} className="submit-button">
              Submit Quiz
            </button>
          ) : (
            <button onClick={onNext} className="nav-button primary">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizScreen;