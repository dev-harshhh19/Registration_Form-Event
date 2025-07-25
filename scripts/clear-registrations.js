const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../data/registrations.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('DELETE FROM registrations', function(err) {
    if (err) {
      console.error('Error deleting registrations:', err.message);
      process.exit(1);
    } else {
      console.log('All user registrations have been deleted.');
      process.exit(0);
    }
  });
}); 