/**
 * Socket.io event handlers
 */
module.exports = function(io) {
  // Store active users by room
  const roomUsers = {};
  
  // Store host media status by room for reconnecting clients
  const hostMediaStatus = {};
  
  io.on('connection', (socket) => {
    // Extract basic info from connection query
    const { roomId, username, userId, role } = socket.handshake.query;
    
    console.log(`User connected: ${username} (${userId}) with role ${role} to room ${roomId}`);
    
    // Store user's current room and info for disconnection handling
    let currentRoom = roomId;
    let currentUser = { userId, username, role };
    
    // Join a room
    socket.on('joinRoom', ({ roomId, user }) => {
      // If user object is provided, use it; otherwise use connection query data
      const userData = user || { userId, username, role };
      currentRoom = roomId;
      currentUser = userData;
      
      socket.join(roomId);
      console.log(`${userData.username} joined room ${roomId} as ${userData.role}`);
      
      // Initialize room users array if not exists
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }
      
      // Add user to room users (avoid duplicates)
      const existingUserIndex = roomUsers[roomId].findIndex(u => u.userId === userData.userId);
      if (existingUserIndex >= 0) {
        // Update existing user entry
        roomUsers[roomId][existingUserIndex] = {
          userId: userData.userId,
          username: userData.username,
          role: userData.role,
          socketId: socket.id
        };
      } else {
        // Add new user entry
        roomUsers[roomId].push({
          userId: userData.userId,
          username: userData.username,
          role: userData.role,
          socketId: socket.id
        });
      }
      
      // Notify all users in the room
      io.to(roomId).emit('message', {
        id: Date.now(),
        userId: 'system',
        username: 'System',
        text: `${userData.username} has joined the room`,
        timestamp: new Date().toISOString()
      });
      
      // Send current users list to the room
      io.to(roomId).emit('roomUsers', roomUsers[roomId]);
      
      // Send viewer count
      io.to(roomId).emit('viewerCount', roomUsers[roomId].length);
      
      // If this is audience, send current host media status if available
      if (userData.role === 'audience' && hostMediaStatus[roomId]) {
        socket.emit('hostMediaStatus', hostMediaStatus[roomId]);
      }
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
    
    // Request for user list (typically from host)
    socket.on('requestUserList', ({ roomId }) => {
      console.log(`User list requested for room ${roomId}`);
      if (roomUsers[roomId]) {
        // Send user list to the requester
        socket.emit('userList', roomUsers[roomId]);
      } else {
        socket.emit('userList', []);
      }
    });
    
    // Permission changes
    socket.on('permissionChange', ({ roomId, type, allowed }) => {
      console.log(`Permission change in ${roomId}: ${type} set to ${allowed}`);
      // Broadcast to all users in the room
      io.to(roomId).emit('permissionChange', { type, allowed });
    });
    
    // Host media status update
    socket.on('hostMediaStatus', ({ roomId, audioEnabled, videoEnabled }) => {
      console.log(`Host media status update for room ${roomId}: audio=${audioEnabled}, video=${videoEnabled}`);
      
      // Store the current status for reconnecting clients
      hostMediaStatus[roomId] = { audioEnabled, videoEnabled };
      
      // Broadcast to all users in the room except sender
      socket.to(roomId).emit('hostMediaStatus', { audioEnabled, videoEnabled });
    });
    
    // Request host media status (for clients joining or reconnecting)
    socket.on('requestHostMediaStatus', ({ roomId }) => {
      console.log(`Host media status requested for room ${roomId}`);
      if (hostMediaStatus[roomId]) {
        socket.emit('hostMediaStatus', hostMediaStatus[roomId]);
      }
    });
    
    // Kick user
    socket.on('kickUser', ({ roomId, userIdToKick }) => {
      console.log(`User kick requested in ${roomId} for user ${userIdToKick}`);
      // Find the user to kick
      const userToKick = roomUsers[roomId]?.find(u => u.userId == userIdToKick);
      
      if (userToKick) {
        console.log(`Kicking user ${userToKick.username} from room ${roomId}`);
        // Send kick notification to that specific socket
        io.to(userToKick.socketId).emit('kickedFromRoom');
        
        // Remove from our tracking
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId != userIdToKick);
        
        // Notify remaining users
        io.to(roomId).emit('message', {
          id: Date.now(),
          userId: 'system',
          username: 'System',
          text: `${userToKick.username} has been removed from the room`,
          timestamp: new Date().toISOString()
        });
        
        // Update room users list
        io.to(roomId).emit('roomUsers', roomUsers[roomId]);
        
        // Update viewer count
        io.to(roomId).emit('viewerCount', roomUsers[roomId].length);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${username} (${userId})`);
      
      // Remove user from roomUsers
      if (currentRoom && roomUsers[currentRoom]) {
        // Find the disconnected user
        const disconnectedUser = roomUsers[currentRoom].find(u => u.socketId === socket.id);
        
        // Remove from room
        roomUsers[currentRoom] = roomUsers[currentRoom].filter(user => user.socketId !== socket.id);
        
        // Delete room if empty
        if (roomUsers[currentRoom].length === 0) {
          console.log(`Room ${currentRoom} is now empty, removing`);
          delete roomUsers[currentRoom];
          // Also clean up host media status
          delete hostMediaStatus[currentRoom];
        } else {
          // Notify remaining users if we found who disconnected
          if (disconnectedUser) {
            io.to(currentRoom).emit('message', {
              id: Date.now(),
              userId: 'system',
              username: 'System',
              text: `${disconnectedUser.username} has left the room`,
              timestamp: new Date().toISOString()
            });
          }
          
          // Update room users list
          io.to(currentRoom).emit('roomUsers', roomUsers[currentRoom]);
          
          // Update viewer count
          io.to(currentRoom).emit('viewerCount', roomUsers[currentRoom].length);
        }
      }
    });
  });
};