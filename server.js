// server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const fs = require('fs');
const publicFolders = fs.readdirSync('public');
const path = require('path');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./botDatabase.db');
const bodyParser = require('body-parser');

const app = express();

// Session setup must be before passport initialization
app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
}));

// Serve static files with specific routes
publicFolders.forEach(folder => {
    if (folder !== 'dashboard' && folder !== 'login') {
        app.use(`/${folder}`, express.static(path.join('public', folder)));
    }
});

// Serve dashboard and login under the root route based on authentication status
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login', 'index.html'));
    }
});

// Serve static files for dashboard and login explicitly
app.use('/dashboard', express.static(path.join('public', 'dashboard')));
app.use('/login', express.static(path.join('public', 'login')));

// Authentication routes
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

// Provide user data
app.get('/get-user', ensureAuthenticated, (req, res) => {
    res.json(req.user);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// dashboard API routes
app.get('/bot-status', (req, res) => {
    const totalServers = client.guilds.cache.size;
    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    res.json({ servers: totalServers, members: totalMembers });
});

app.get('/get-server-config', ensureAuthenticated, (req, res) => {
    const serverId = req.query.serverId;
    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
        return res.status(404).send('Server not found');
    }
    if (guild.ownerId !== req.user.id) {
        return res.status(403).send('Unauthorized: You are not the owner of this server');
    }
    db.get(`SELECT * FROM servers WHERE server_id = ?`, [serverId], (err, row) => {
        if (err) {
            console.error('Failed to retrieve server config:', err);
            res.status(500).send('Error fetching server configuration');
        } else {
            res.json({
                welcome_enabled: row.welcome_enabled,
                goodbye_enabled: row.goodbye_enabled
            });
        }
    });
});

app.use(bodyParser.json()); // Middleware to parse JSON bodies

app.post('/update-server-config', ensureAuthenticated, (req, res) => {
    const { serverId, configKey, configValue } = req.body;
    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
        return res.status(404).send('Server not found');
    }
    if (guild.ownerId !== req.user.id) {
        return res.status(403).send('Unauthorized: You are not the owner of this server');
    }
    const sql = `UPDATE servers SET ${configKey} = ? WHERE server_id = ?`;
    db.run(sql, [configValue, serverId], (err) => {
        if (err) {
            console.error('Failed to update server config:', err);
            res.status(500).send('Error updating server configuration');
        } else {
            res.send('Server configuration updated successfully');
        }
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));