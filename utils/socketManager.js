import { getBotClient } from './botManager.js';


export const setupSocketEvents = (io) => {
  const connections = new Map();
  
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    
    socket.on('authenticate', async (data) => {
      const { token } = data;
      
      if (!token) {
        socket.emit('error', { message: 'No token provided' });
        return;
      }
      
      try {
        const client = await getBotClient(token);
        
        if (!client || !client.isReady()) {
          socket.emit('error', { message: 'Bot is not connected' });
          return;
        }
        
        if (!connections.has(token)) {
          connections.set(token, new Set());
        }
        connections.get(token).add(socket);
        
        socket.data.token = token;
        
        setupBotEventListeners(client, token, connections);
        
        socket.emit('authenticated', { success: true });
        
        socket.emit('connectionStatus', { 
          connected: true,
          status: client.user.presence.status,
          uptime: client.uptime
        });
      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });
    
    socket.on('joinChannel', (channelId) => {
      const rooms = Array.from(socket.rooms)
        .filter(room => room.startsWith('channel:'));
      
      rooms.forEach(room => {
        socket.leave(room);
      });
      
      socket.join(`channel:${channelId}`);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });
    
    socket.on('disconnect', () => {
      const token = socket.data.token;
      if (token && connections.has(token)) {
        connections.get(token).delete(socket);
        
        if (connections.get(token).size === 0) {
          connections.delete(token);
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const setupBotEventListeners = (client, token, connections) => {
  if (client.listenerCount('messageCreate') > 0) {
    return;
  }
  
  client.on('messageCreate', (message) => {
    const channelRoom = `channel:${message.channelId}`;
    
    const sockets = connections.get(token);
    if (!sockets) return;
    
    const messageData = {
      id: message.id,
      content: message.content,
      author: {
        id: message.author.id,
        username: message.author.username,
        avatar: message.author.displayAvatarURL({ format: 'png', size: 64 }),
        bot: message.author.bot
      },
      channelId: message.channelId,
      guildId: message.guildId,
      timestamp: message.createdAt
    };
    
    for (const socket of sockets) {
      if (socket.rooms.has(channelRoom)) {
        socket.emit('messageCreate', messageData);
      }
    }
  });
  
  client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (newPresence.userId === client.user.id) {
      const presenceData = {
        status: newPresence.status,
        activity: newPresence.activities[0]?.name,
        type: newPresence.activities[0]?.type
      };
      
      const sockets = connections.get(token);
      if (!sockets) return;
      
      for (const socket of sockets) {
        socket.emit('presenceUpdate', presenceData);
      }
    }
  });
  
  client.on('guildCreate', (guild) => {
    const guildData = {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ format: 'png', size: 128 }),
      memberCount: guild.memberCount
    };
    
    const sockets = connections.get(token);
    if (!sockets) return;
    
    for (const socket of sockets) {
      socket.emit('guildCreate', guildData);
    }
  });
  
  client.on('guildDelete', (guild) => {
    const sockets = connections.get(token);
    if (!sockets) return;
    
    for (const socket of sockets) {
      socket.emit('guildDelete', { id: guild.id });
    }
  });
  
  client.on('channelCreate', (channel) => {
    if (!channel.guild) return;
    
    const sockets = connections.get(token);
    if (!sockets) return;
    
    if (channel.type === 0 || channel.type === 5) { 
      const channelData = {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        guildId: channel.guildId,
        parentId: channel.parentId
      };
      
      for (const socket of sockets) {
        socket.emit('channelCreate', channelData);
      }
    }
  });
  
  client.on('channelDelete', (channel) => {
    if (!channel.guild) return;
    
    const sockets = connections.get(token);
    if (!sockets) return;
    
    if (channel.type === 0 || channel.type === 5) {
      for (const socket of sockets) {
        socket.emit('channelDelete', { id: channel.id, guildId: channel.guildId });
      }
    }
  });
  
  client.on('error', (error) => {
    console.error('Discord client error:', error);
    
    const sockets = connections.get(token);
    if (!sockets) return;
    
    for (const socket of sockets) {
      socket.emit('botError', { message: error.message });
    }
  });
};