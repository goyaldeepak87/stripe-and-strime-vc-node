const http = require('http');
const { Server } = require('socket.io');
const config = require('./config/config')
const app = require('./app')

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', ({ room, uid }) => {
        socket.join(room);
        socket.to(room).emit('user-joined', uid);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});


server.listen(config.port, () => {
    console.log("port", config.port)
})