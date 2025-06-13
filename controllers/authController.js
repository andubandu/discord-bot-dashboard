import { Client, GatewayIntentBits } from 'discord.js';

export const validateToken = async (token) => {
  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    
    await client.login(token);
    
    const user = client.user;
    
    client.destroy();
    
    if (!user) {
      throw new Error('Failed to retrieve bot data');
    }
    
    return {
      id: user.id,
      username: user.username,
      avatar: user.displayAvatarURL({ format: 'png', size: 128 }),
      discriminator: user.discriminator
    };
  } catch (error) {
    console.error('Token validation error:', error);
    throw new Error('Invalid token');
  }
};