const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbPath = path.join(__dirname, 'database', 'university.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to university.db');
  }
});

app.get('/api/courses', (req, res) => {
  db.all('SELECT * FROM courses', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json(row);
  });
});

app.post('/api/courses', (req, res) => {
  const { courseCode, title, credits, description, semester } = req.body;

  if (!courseCode || !title || credits == null || !semester) {
    return res.status(400).json({
      error: 'courseCode, title, credits, and semester are required'
    });
  }

  const sql = `INSERT INTO courses (courseCode, title, credits, description, semester)
               VALUES (?, ?, ?, ?, ?)`;
  const params = [courseCode, title, credits, description || '', semester];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      courseCode,
      title,
      credits,
      description: description || '',
      semester
    });
  });
});

// PUT /api/courses/:id - UPDATE existing course
app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const { courseCode, title, credits, description, semester } = req.body;

  if (!courseCode || !title || credits == null || !semester) {
    return res.status(400).json({
      error: 'courseCode, title, credits, and semester are required'
    });
  }

  const sql = `UPDATE courses
               SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ?
               WHERE id = ?`;
  const params = [courseCode, title, credits, description || '', semester, id];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json({
      id: Number(id),
      courseCode,
      title,
      credits,
      description: description || '',
      semester
    });
  });
});

// DELETE /api/courses/:id - DELETE course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM courses WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted', id: Number(id) });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
