// server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const fs = require('fs');
const publicFolders = fs.readdirSync('public');
const path = require('path');
require('dotenv').config();

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

app.get('/bot-status', (req, res) => {
    const totalServers = client.guilds.cache.size;
    const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    res.json({ servers: totalServers, members: totalMembers });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));