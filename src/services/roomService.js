/**
 * Room service for managing active rooms and users
 */

class RoomService {
    constructor() {
      // Map of roomId -> Map of userId -> userInfo
      this.rooms = new Map();
      
      // Activity tracking
      this.lastActivity = new Map();
      
      // Set up room cleanup interval (clear inactive rooms after 1 hour)
      this.cleanupInterval = setInterval(() => this.cleanupInactiveRooms(), 15 * 60 * 1000);
    }
    
    /**
     * Add user to a room
     * @param {string} roomId - Room identifier
     * @param {string} userId - User identifier
     * @param {Object} userInfo - User information
     * @returns {Map} The room users map
     */
    addUserToRoom(roomId, userId, userInfo) {
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Map());
      }
      
      const room = this.rooms.get(roomId);
      room.set(userId, userInfo);
      
      // Update activity timestamp
      this.lastActivity.set(roomId, Date.now());
      
      return room;
    }
    
    /**
     * Remove user from a room
     * @param {string} roomId - Room identifier
     * @param {string} userId - User identifier
     * @returns {boolean} True if user was removed, false if room or user not found
     */
    removeUserFromRoom(roomId, userId) {
      if (!this.rooms.has(roomId)) {
        return false;
      }
      
      const room = this.rooms.get(roomId);
      const removed = room.delete(userId);
      
      // Remove room if empty
      if (room.size === 0) {
        this.rooms.delete(roomId);
        this.lastActivity.delete(roomId);
      } else {
        // Update activity timestamp
        this.lastActivity.set(roomId, Date.now());
      }
      
      return removed;
    }
    
    /**
     * Get all users in a room
     * @param {string} roomId - Room identifier
     * @returns {Array|null} Array of user objects or null if room not found
     */
    getUsersInRoom(roomId) {
      if (!this.rooms.has(roomId)) {
        return null;
      }
      
      // Update activity timestamp
      this.lastActivity.set(roomId, Date.now());
      
      return Array.from(this.rooms.get(roomId).values());
    }
    
    /**
     * Get user from a room
     * @param {string} roomId - Room identifier
     * @param {string} userId - User identifier
     * @returns {Object|null} User object or null if not found
     */
    getUser(roomId, userId) {
      if (!this.rooms.has(roomId)) {
        return null;
      }
      
      const room = this.rooms.get(roomId);
      return room.has(userId) ? room.get(userId) : null;
    }
    
    /**
     * Get room info
     * @param {string} roomId - Room identifier
     * @returns {Object|null} Room info or null if not found
     */
    getRoomInfo(roomId) {
      if (!this.rooms.has(roomId)) {
        return null;
      }
      
      const users = this.getUsersInRoom(roomId);
      const hostCount = users.filter(user => user.role === 'host').length;
      
      return {
        roomId,
        usersCount: users.length,
        hostCount,
        isActive: hostCount > 0,
        createdAt: this.lastActivity.get(roomId)
      };
    }
    
    /**
     * Get all active rooms
     * @returns {Array} Array of room info objects
     */
    getAllRooms() {
      const rooms = [];
      
      this.rooms.forEach((_, roomId) => {
        const roomInfo = this.getRoomInfo(roomId);
        if (roomInfo) {
          rooms.push(roomInfo);
        }
      });
      
      return rooms;
    }
    
    /**
     * Clean up inactive rooms
     * Removes rooms that have been inactive for over 1 hour
     */
    cleanupInactiveRooms() {
      const now = Date.now();
      const inactiveThreshold = 60 * 60 * 1000; // 1 hour
      
      this.lastActivity.forEach((timestamp, roomId) => {
        if (now - timestamp > inactiveThreshold) {
          this.rooms.delete(roomId);
          this.lastActivity.delete(roomId);
          console.log(`Room ${roomId} removed due to inactivity`);
        }
      });
    }
    
    /**
     * Destroy room service and clear intervals
     */
    destroy() {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
    }
  }
  
  module.exports = new RoomService();