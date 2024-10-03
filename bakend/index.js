// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

//my code
const bcrypt = require('bcrypt'); //to hash passwords
const bodyParser = require('body-parser'); // to parse request bodies

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const CHAT_FILE = path.join(__dirname, 'chatData.json');

//my code: add another file to store username and passwords
const USERS_FILE = path.join(__dirname, 'users.json');


// Load chat history when the server starts
let chatHistory = [];

//my code: to track all users who have sent messages
let users = new Set();
//my code: to track currently online users
let onlineUsers = {};
//my code: store registered users with their password as hashes
let userDatabase = {};

if (fs.existsSync(CHAT_FILE)) {
    const data = fs.readFileSync(CHAT_FILE);
    //my code: load only the last 10 messages on server start
    chatHistory = JSON.parse(data).slice(-10);


    //my code
    chatHistory.forEach(message => {
        if (message.username){
            users.add(message.username);
        }
    });
}

//my code: load users data, username and password
if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE);
    userDatabase = JSON.parse(data);
}

// Serve static files (for client-side)
app.use(express.static('../public'));

//my code: use it to parse json request bodies
app.use(bodyParser.json());

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Expect the client to send a username
    socket.on('set username', (username) => {
        socket.username = username;
        console.log(`${username} connected`);

        // Send the chat history to the new user
        socket.emit('chat history', chatHistory);

        //my code
        onlineUsers[socket.id] = username;
        io.emit('online users', Object.values(onlineUsers));

    });

    // Handle incoming messages
    socket.on('chat message', (msg) => {
        const messageData = {
            id: socket.id,
            username: socket.username || 'Anonymous',
            message: msg,
            timestamp: new Date()
        };

        // Add message to chat history
        chatHistory.push(messageData);

        //my code: keep only the last 10 messages
        chatHistory = chatHistory.slice(-10);

        // Save chat history to the file
        fs.writeFileSync(CHAT_FILE, JSON.stringify(chatHistory, null, 2));

        //my code: track the user who sent the message
        if (messageData.username) {
            users.add(messageData.username);
        }
        
        // Broadcast message to all clients
        io.emit('chat message', messageData);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.username || 'Anonymous');

        //my code: remove the user from onlineUsers
        delete onlineUsers[socket.id];
        //my code: notify all users about the updated online list
        io.emit('online users', Object.values(onlineUsers));
    });
});

app.get('/api/users', (req, res) => {
  // to-do
  //my code
  res.json(Array.from(users));
});

//my code
app.get('/api/online-users', (req, res) => {
    res.json(Object.values(onlineUsers));
});

//my code: registeration api
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Entring username and password is required'});
    }
    if (userDatabase[username]) {
        return res.status(400).json( { message: 'Username already exists. please login.'});
    }
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        userDatabase[username] = { password: hashedPass };
        fs.writeFileSync(USERS_FILE, JSON.stringify(userDatabase, null, 2));
        return res.status(201).json({ message: 'Registered successfully!' });
    } catch (error) {
        return res.status(500).json({ message: 'Error in registeration!' });
    }
});

//my code: login api
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Entring username and password is required' });
    }
    
    const user = userDatabase[username];
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    try {
        const matched = await bcrypt.compare(password, user.password);
        if (matched) {
            return res.status(200).json({ message: 'logined successfully.' });
        } else {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'error logging in.' });
    }
});

// Start the server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


