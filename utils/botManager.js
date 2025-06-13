const botClients = new Map();

export const storeBotClient = (token, client) => {
  const maskedToken = maskToken(token);
  console.log(`Storing bot client for ${maskedToken}`);
  
  botClients.set(token, client);
  
  client.on('disconnect', () => {
    console.log(`Bot ${maskedToken} disconnected`);
  });
};


export const getBotClient = async (token) => {
  const client = botClients.get(token);
  
  if (!client) {
    return null;
  }
  
  if (!client.isReady()) {
    try {
      await client.login(token);
    } catch (error) {
      console.error('Error reconnecting bot:', error);
      return null;
    }
  }
  
  return client;
};


export const removeBotClient = (token) => {
  const client = botClients.get(token);
  
  if (client) {
    if (client.isReady()) {
      client.destroy();
    }
    botClients.delete(token);
    return true;
  }
  
  return false;
};


const maskToken = (token) => {
  if (!token) return 'undefined';
  
  const first = token.slice(0, 4);
  const last = token.slice(-4);
  
  return `${first}...${last}`;
};