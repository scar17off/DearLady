const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS servers (
        server_id TEXT PRIMARY KEY,
        welcome_channel NUMBER,
        goodbye_channel NUMBER,
        welcome_message TEXT,
        goodbye_message TEXT,
        welcome_enabled BOOLEAN DEFAULT FALSE,
        goodbye_enabled BOOLEAN DEFAULT FALSE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        birthday DATE,
        gender TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_xp (
        user_id TEXT NOT NULL,
        server_id TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        PRIMARY KEY (user_id, server_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS command_usage (
        command TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0 NOT NULL
    )`);
});

db.close();