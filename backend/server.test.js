const request = require('supertest');
const app = require('./server');

describe('Quiz API Tests', () => {
  
  test('GET /api/questions should return questions without correct answers', async () => {
    const response = await request(app).get('/api/questions');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('questions');
    expect(Array.isArray(response.body.questions)).toBe(true);
    
    if (response.body.questions.length > 0) {
      const question = response.body.questions[0];
      expect(question).not.toHaveProperty('correct_option');
      expect(question).toHaveProperty('question_text');
      expect(question).toHaveProperty('option_a');
    }
  });

  test('POST /api/submit should calculate score correctly', async () => {
    const answers = {
      1: 'a',
      2: 'b',
      3: 'b',
      4: 'c',
      5: 'c'
    };

    const response = await request(app)
      .post('/api/submit')
      .send({ answers });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('score');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('percentage');
    expect(response.body.score).toBeLessThanOrEqual(response.body.total);
  });

  test('POST /api/submit should handle invalid data', async () => {
    const response = await request(app)
      .post('/api/submit')
      .send({ answers: 'invalid' });

    expect(response.status).toBe(400);
  });
});