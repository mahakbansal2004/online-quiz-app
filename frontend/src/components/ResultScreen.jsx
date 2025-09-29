import React from 'react';
import jsPDF from 'jspdf';
import './ResultScreen.css';

function ResultScreen({ result, questions, userName, onRestart, onViewLeaderboard }) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Quiz Results', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // User Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${userName || 'Anonymous'}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Score: ${result.score}/${result.total} (${result.percentage}%)`, 20, yPosition);
    yPosition += 15;
    
    // Results
    doc.setFontSize(14);
    doc.text('Detailed Results:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    result.results.forEach((r, index) => {
      const question = questions.find(q => q.id === r.questionId);
      
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setTextColor(r.isCorrect ? 0 : 255, r.isCorrect ? 128 : 0, 0);
      doc.text(`Q${index + 1}: ${r.isCorrect ? 'Correct' : 'Wrong'}`, 20, yPosition);
      yPosition += 7;
      
      doc.setTextColor(0, 0, 0);
      const questionLines = doc.splitTextToSize(question?.question_text || '', 170);
      questionLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
      
      doc.text(`Your answer: ${r.userAnswer?.toUpperCase() || 'Not answered'}`, 20, yPosition);
      yPosition += 5;
      
      if (!r.isCorrect) {
        doc.text(`Correct answer: ${r.correctAnswer.toUpperCase()}`, 20, yPosition);
        yPosition += 5;
      }
      
      yPosition += 5;
    });
    
    doc.save(`quiz-results-${userName || 'anonymous'}-${Date.now()}.pdf`);
  };

  const getScoreMessage = (percentage) => {
    if (percentage === 100) return 'Perfect Score! 🎉';
    if (percentage >= 80) return 'Excellent! 🌟';
    if (percentage >= 60) return 'Good Job! 👍';
    if (percentage >= 40) return 'Not Bad! 📚';
    return 'Keep Practicing! 💪';
  };

  return (
    <div className="result-screen">
      <div className="result-container">
        <h1>Quiz Complete!</h1>
        
        <div className="score-card">
          <div className="score-circle">
            <span className="score-number">{result.score}</span>
            <span className="score-total">/ {result.total}</span>
          </div>
          <p className="score-message">{getScoreMessage(result.percentage)}</p>
          <p className="percentage">{result.percentage}% Correct</p>
        </div>

        <div className="answers-review">
          <h2>Review Your Answers</h2>
          {result.results.map((r, index) => {
            const question = questions.find(q => q.id === r.questionId);
            return (
              <div key={r.questionId} className={`review-item ${r.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="review-header">
                  <span className="question-number">Q{index + 1}</span>
                  <span className={`result-badge ${r.isCorrect ? 'correct' : 'incorrect'}`}>
                    {r.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>
                <p className="review-question">{question?.question_text}</p>
                <div className="review-answers">
                  <p>Your answer: <strong>{r.userAnswer?.toUpperCase() || 'Not answered'}</strong></p>
                  {!r.isCorrect && (
                    <p className="correct-answer">Correct answer: <strong>{r.correctAnswer.toUpperCase()}</strong></p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <button onClick={exportToPDF} className="export-button">
            Export PDF
          </button>
          {onViewLeaderboard && (
            <button onClick={onViewLeaderboard} className="leaderboard-button">
              View Leaderboard
            </button>
          )}
          <button onClick={onRestart} className="restart-button">
            Take Quiz Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;