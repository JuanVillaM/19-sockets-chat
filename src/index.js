const path = require('path');
const http = require('http');
const express = require('express');
const Filter = require('bad-words');
const socketio = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInChat } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New web socket connection.');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.chat);

        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.chat).emit('message', generateMessage('Admin', `${user.username} has joined to the Chat!`));
        io.to(user.chat).emit('chatData', {
            chat: user.chat,
            users: getUsersInChat(user.chat)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        io.to(user.chat).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.chat).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.chat).emit('message', generateMessage('Admin', `${user.username} has left the chat!`));
            io.to(user.chat).emit('chatData', {
                chat: user.chat,
                users: getUsersInChat(user.chat)
            });
        }
    });

});

server.listen(port, () => {
    console.log(`Server is up on port: ${port}!.`);
});