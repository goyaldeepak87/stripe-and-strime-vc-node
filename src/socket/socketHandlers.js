/**
 * Socket.io event handlers
 */
module.exports = function(io) {
    // Store active users by room
    const roomUsers = {};
    
    io.on('connection', (socket) => {
      const { roomId, username, userId } = socket.handshake.query;
      
      console.log(`User connected: ${username} (${userId}) to room ${roomId}`);
      
      // Join a room
      socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
        console.log(`${username} joined room ${roomId}`);
        
        // Initialize room users array if not exists
        if (!roomUsers[roomId]) {
          roomUsers[roomId] = [];
        }
        
        // Add user to room users
        roomUsers[roomId].push({
          id: userId,
          username,
          socketId: socket.id
        });
        
        // Notify all users in the room
        io.to(roomId).emit('message', {
          id: Date.now(),
          userId: 'system',
          username: 'System',
          text: `${username} has joined the room`,
          timestamp: new Date().toISOString()
        });
        
        // Send current users list to the room
        io.to(roomId).emit('roomUsers', roomUsers[roomId]);
      });
      
      // Handle chat messages
      socket.on('message', ({ roomId, message }) => {
        console.log(`New message in ${roomId} from ${message.username}: ${message.text}`);
        io.to(roomId).emit('message', message);
      });
      
      // Handle reactions
      socket.on('reaction', ({ roomId, reaction }) => {
        console.log(`New reaction in ${roomId} from ${reaction.username}: ${reaction.type}`);
        io.to(roomId).emit('reaction', reaction);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${username} (${userId})`);
        
        // Remove user from roomUsers
        if (roomId && roomUsers[roomId]) {
          roomUsers[roomId] = roomUsers[roomId].filter(user => user.socketId !== socket.id);
          
          // Delete room if empty
          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
          } else {
            // Notify remaining users
            io.to(roomId).emit('message', {
              id: Date.now(),
              userId: 'system',
              username: 'System',
              text: `${username} has left the room`,
              timestamp: new Date().toISOString()
            });
            
            // Update room users list
            io.to(roomId).emit('roomUsers', roomUsers[roomId]);
          }
        }
      });
    });
  };