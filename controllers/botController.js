import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { getBotClient, storeBotClient } from '../utils/botManager.js';

export const getDashboardData = async (token) => {
  let client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });
    
    await client.login(token);
    storeBotClient(token, client);
  }
  
  const botUser = client.user;
  const guilds = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ format: 'png', size: 128 }),
    memberCount: guild.memberCount
  }));
  
  const presenceData = {
    status: client.user.presence.status || 'online',
    activity: client.user.presence.activities[0]?.name || null,
    type: client.user.presence.activities[0]?.type || null
  };
  
  return {
    bot: {
      id: botUser.id,
      username: botUser.username,
      discriminator: botUser.discriminator,
      avatar: botUser.displayAvatarURL({ format: 'png', size: 128 }),
      presence: presenceData
    },
    guilds,
    connectedAt: client.readyAt,
    uptime: client.uptime
  };
};

export const getGuilds = async (token, guildId = null) => {
  const client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    throw new Error('Bot is not connected');
  }
  
  if (guildId) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      throw new Error('Guild not found');
    }
    
    return {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ format: 'png', size: 128 }),
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
      description: guild.description || '',
      features: guild.features
    };
  }
  
  return client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ format: 'png', size: 128 }),
    memberCount: guild.memberCount
  }));
};


export const getChannels = async (token, guildId) => {
  const client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    throw new Error('Bot is not connected');
  }
  
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  const categories = guild.channels.cache
    .filter(channel => channel.type === 4) 
    .map(category => ({
      id: category.id,
      name: category.name,
      position: category.position,
      channels: []
    }));
  categories.sort((a, b) => a.position - b.position);
  
  const textChannels = guild.channels.cache.filter(
    channel => channel.type === 0 || channel.type === 5 
  );
  
  textChannels.forEach(channel => {
    const categoryId = channel.parentId;
    const channelData = {
      id: channel.id,
      name: channel.name,
      position: channel.position,
      topic: channel.topic || '',
      nsfw: channel.nsfw
    };
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      category.channels.push(channelData);
    } else {
      let noCategory = categories.find(cat => cat.name === 'No Category');
      if (!noCategory) {
        noCategory = {
          id: 'no-category',
          name: 'No Category',
          position: -1,
          channels: []
        };
        categories.push(noCategory);
      }
      noCategory.channels.push(channelData);
    }
  });
  
  categories.forEach(category => {
    category.channels.sort((a, b) => a.position - b.position);
  });
  
  return categories;
};


export const getMessages = async (token, channelId, limit = 50) => {
  const client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    throw new Error('Bot is not connected');
  }
  
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }
  
  try {
    const messages = await channel.messages.fetch({ limit });
    
    return Array.from(messages.values()).map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        avatar: msg.author.displayAvatarURL({ format: 'png', size: 64 }),
        bot: msg.author.bot
      },
      timestamp: msg.createdAt,
      attachments: msg.attachments.map(attachment => ({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.name,
        contentType: attachment.contentType
      })),
      embeds: msg.embeds.map(embed => ({
        title: embed.title,
        description: embed.description,
        color: embed.color,
        fields: embed.fields
      }))
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
};


export const sendMessage = async (token, channelId, content) => {
  const client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    throw new Error('Bot is not connected');
  }
  
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }
  
  try {
    const message = await channel.send(content);
    
    return {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.createdAt
      }
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};


export const updatePresence = async (token, status, activity, type) => {
  const client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    throw new Error('Bot is not connected');
  }
  
  try {
    const activityOptions = {};
    
    if (activity) {
      let activityType;
      switch (type?.toLowerCase()) {
        case 'playing':
          activityType = ActivityType.Playing;
          break;
        case 'streaming':
          activityType = ActivityType.Streaming;
          break;
        case 'listening':
          activityType = ActivityType.Listening;
          break;
        case 'watching':
          activityType = ActivityType.Watching;
          break;
        case 'competing':
          activityType = ActivityType.Competing;
          break;
        default:
          activityType = ActivityType.Playing;
      }
      
      activityOptions.activities = [{
        name: activity,
        type: activityType
      }];
    }
    
    if (status) {
      activityOptions.status = status;
    }
    
    await client.user.setPresence(activityOptions);
    
    return {
      success: true,
      presence: {
        status: client.user.presence.status,
        activity: client.user.presence.activities[0]?.name || null,
        type: client.user.presence.activities[0]?.type || null
      }
    };
  } catch (error) {
    console.error('Error updating presence:', error);
    throw new Error('Failed to update presence');
  }
};


export const executeCommand = async (token, command, channelId) => {

  
  try {
    const messageSent = await sendMessage(token, channelId, command);
    
    return {
      success: true,
      executed: command,
      message: messageSent.message,
      result: "Command executed. Check the channel for bot's response."
    };
  } catch (error) {
    console.error('Error executing command:', error);
    throw new Error('Failed to execute command');
  }
};


export const getGuildMembers = async (token, guildId) => {
  const client = await getBotClient(token);
  
  if (!client || !client.isReady()) {
    throw new Error('Bot is not connected');
  }
  
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  try {
    if (guild.members.cache.size < guild.memberCount) {
      await guild.members.fetch();
    }
    
    return guild.members.cache.map(member => ({
      id: member.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatar: member.user.displayAvatarURL({ format: 'png', size: 64 }),
      nickname: member.nickname,
      joinedAt: member.joinedAt,
      bot: member.user.bot,
      roles: member.roles.cache
        .filter(role => role.id !== guild.id) 
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          position: role.position
        }))
        .sort((a, b) => b.position - a.position) 
    }));
  } catch (error) {
    console.error('Error fetching members:', error);
    throw new Error('Failed to fetch members');
  }
};