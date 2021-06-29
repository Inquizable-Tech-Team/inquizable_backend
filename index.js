const http = require("http");
const express = require('express')
const app = express()
app.use(express.urlencoded({extended: true})); 
app.use(express.json()); 
const helmet = require("helmet");
const port = process.env.PORT || 3002
const users = require('./routes/Users')
const questions = require('./routes/Questions')
const leaderboard = require('./routes/Leaderboard')
const socketIo = require("socket.io")
const { addUser, removeUser, getUsersInRoom } = require("./routes/Chat/users");
const { addMessage, getMessagesInRoom } = require("./routes/Chat/message");
const cors = require('cors')
const path = require('path');



app.use(helmet())

//Cors
app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header('Access-Control-Expose-Headers', 'Content-Range')
    next()
})

//Message Server
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true,
    },
});
//More Message and Socket.io
const USER_JOIN_CHAT_EVENT = "USER_JOIN_CHAT_EVENT";
const USER_LEAVE_CHAT_EVENT = "USER_LEAVE_CHAT_EVENT";
const NEW_CHAT_MESSAGE_EVENT = "NEW_CHAT_MESSAGE_EVENT";
const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    // Join a conversation
    const { roomId, nickname } = socket.handshake.query;
    socket.join(roomId);
    const user = addUser(socket.id, roomId, nickname);
    io.in(roomId).emit(USER_JOIN_CHAT_EVENT, user);
    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
        const message = addMessage(roomId, data);
        io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    });
    // Listen typing events
    socket.on(START_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId).emit(START_TYPING_MESSAGE_EVENT, data);
    });
    socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });
    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.in(roomId).emit(USER_LEAVE_CHAT_EVENT, user);
        socket.leave(roomId);

        socket.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
                // the disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            }
            // else the socket will automatically try to reconnect
        });
    });
});
//Socket.io Paths
app.get("/rooms/:roomId/users", (req, res) => {
    const users = getUsersInRoom(req.params.roomId);
    return res.json({ users });
  });
  
  app.get("/rooms/:roomId/messages", (req, res) => {
    const messages = getMessagesInRoom(req.params.roomId);
    return res.json({ messages });
  });
// End of Socket.io

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './documentation.html'))
})

app.use('/', leaderboard)
app.use('/', users)
app.use('/', questions)

app.listen(port, console.log(`Server is listening on port ${port}`))