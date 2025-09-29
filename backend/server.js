const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = new sqlite3.Database('./quiz.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with tables
function initializeDatabase() {
  db.serialize(() => {
    // Create questions table
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating questions table:', err);
      } else {
        console.log('Questions table ready');
        checkAndSeedData();
      }
    });

    // Create quiz_attempts table (bonus)
    db.run(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating quiz_attempts table:', err);
      } else {
        console.log('Quiz attempts table ready');
      }
    });
  });
}

// Check if we need to seed data
function checkAndSeedData() {
  db.get('SELECT COUNT(*) as count FROM questions', [], (err, row) => {
    if (err) {
      console.error('Error checking questions:', err);
      return;
    }
    
    if (row && row.count === 0) {
      console.log('No questions found, seeding database...');
      seedQuestions();
    } else {
      console.log(`Database already has ${row.count} questions`);
    }
  });
}

// Seed sample questions
function seedQuestions() {
  const questions = [
    // HTML/CSS Category
    {
      text: 'What does HTML stand for?',
      a: 'Hyper Text Markup Language',
      b: 'High Tech Modern Language',
      c: 'Home Tool Markup Language',
      d: 'Hyperlinks and Text Markup Language',
      correct: 'a'
    },
    {
      text: 'Which CSS property is used to change text color?',
      a: 'text-color',
      b: 'font-color',
      c: 'color',
      d: 'text-style',
      correct: 'c'
    },
    // JavaScript Category
    {
      text: 'Which of these is a JavaScript framework?',
      a: 'Django',
      b: 'Flask',
      c: 'React',
      d: 'Laravel',
      correct: 'c'
    },
    {
      text: 'What is the correct way to declare a variable in JavaScript (ES6)?',
      a: 'var x = 5',
      b: 'let x = 5',
      c: 'variable x = 5',
      d: 'x := 5',
      correct: 'b'
    },
    // Database Category
    {
      text: 'What does SQL stand for?',
      a: 'Stylish Question Language',
      b: 'Structured Query Language',
      c: 'Statement Question Language',
      d: 'Strong Query Language',
      correct: 'b'
    },
    {
      text: 'Which SQL command is used to retrieve data?',
      a: 'GET',
      b: 'FETCH',
      c: 'SELECT',
      d: 'RETRIEVE',
      correct: 'c'
    },
    // Networking Category
    {
      text: 'What is the default port for HTTP?',
      a: '443',
      b: '8080',
      c: '80',
      d: '3000',
      correct: 'c'
    },
    {
      text: 'What does API stand for?',
      a: 'Application Programming Interface',
      b: 'Advanced Programming Integration',
      c: 'Automated Program Interaction',
      d: 'Application Process Integration',
      correct: 'a'
    },
    // General Programming
    {
      text: 'Which data structure uses LIFO (Last In First Out)?',
      a: 'Queue',
      b: 'Stack',
      c: 'Array',
      d: 'Tree',
      correct: 'b'
    },
    {
      text: 'What does JSON stand for?',
      a: 'JavaScript Object Notation',
      b: 'Java Standard Object Notation',
      c: 'JavaScript Oriented Network',
      d: 'Java Serialized Object Note',
      correct: 'a'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  questions.forEach(q => {
    stmt.run(q.text, q.a, q.b, q.c, q.d, q.correct);
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error seeding questions:', err);
    } else {
      console.log('10 questions seeded successfully');
    }
  });
}
// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quiz API is running' });
});

// GET all questions (without correct answers)
app.get('/api/questions', (req, res) => {
  db.all(
    'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions', 
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching questions:', err);
        return res.status(500).json({ error: 'Failed to fetch questions' });
      }
      res.json({ questions: rows });
    }
  );
});


// POST submit answers and get score
app.post('/api/submit', (req, res) => {
  const { answers, userName } = req.body;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Invalid answers format' });
  }

  db.all('SELECT id, correct_option FROM questions', [], (err, rows) => {
    if (err) {
      console.error('Error calculating score:', err);
      return res.status(500).json({ error: 'Failed to calculate score' });
    }

    let correctCount = 0;
    const results = [];

    rows.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_option;
      
      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: question.id,
        userAnswer: userAnswer || null,
        correctAnswer: question.correct_option,
        isCorrect
      });
    });

    const score = correctCount;
    const total = rows.length;
    const percentage = Math.round((correctCount / rows.length) * 100);

    // Save attempt to database with better error handling
    const name = userName || 'Anonymous';
    db.run(
      'INSERT INTO quiz_attempts (user_name, score, total_questions) VALUES (?, ?, ?)',
      [name, score, total],
      function(err) {
        if (err) {
          console.error('Error saving quiz attempt:', err);
        } else {
          console.log(`Quiz attempt saved! ID: ${this.lastID}, Score: ${score}/${total}`);
        }
      }
    );

    res.json({
      score,
      total,
      percentage,
      results
    });
  });
});

// GET quiz history (bonus feature)
app.get('/api/history', (req, res) => {
  db.all(
    'SELECT * FROM quiz_attempts ORDER BY timestamp DESC LIMIT 10',
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching history:', err);
        return res.status(500).json({ error: 'Failed to fetch history' });
      }
      res.json({ attempts: rows });
    }
  );
});

// Start server
// GET leaderboard - Top 10 scores
app.get('/api/leaderboard', (req, res) => {
  db.all(
    `SELECT 
      user_name, 
      score, 
      total_questions,
      ROUND((score * 100.0 / total_questions), 2) as percentage,
      timestamp 
    FROM quiz_attempts 
    ORDER BY score DESC, timestamp ASC 
    LIMIT 10`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching leaderboard:', err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard' });
      }
      res.json({ leaderboard: rows });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/questions`);
  console.log(`   - POST http://localhost:${PORT}/api/submit`);
  console.log(`   - GET  http://localhost:${PORT}/api/history`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

// For testing
module.exports = app;