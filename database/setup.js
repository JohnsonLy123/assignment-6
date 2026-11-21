const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'university.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseCode TEXT NOT NULL,
      title TEXT NOT NULL,
      credits INTEGER NOT NULL,
      description TEXT,
      semester TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('Error creating courses table:', err.message);
      } else {
        console.log('Database and courses table successfully created.');
      }
    }
  );
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  }
});
