import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { 
  getGuilds, 
  getChannels, 
  getMessages,
  sendMessage,
  updatePresence,
  executeCommand,
  getGuildMembers
} from '../controllers/botController.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/guilds', async (req, res) => {
  try {
    const guilds = await getGuilds(req.session.token);
    res.json(guilds);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/guilds/:guildId/channels', async (req, res) => {
  try {
    const channels = await getChannels(req.session.token, req.params.guildId);
    res.json(channels);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/channels/:channelId/messages', async (req, res) => {
  try {
    const messages = await getMessages(req.session.token, req.params.channelId);
    res.json(messages);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/channels/:channelId/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const result = await sendMessage(
      req.session.token, 
      req.params.channelId, 
      content
    );
    res.json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/presence', async (req, res) => {
  try {
    const { status, activity, type } = req.body;
    const result = await updatePresence(
      req.session.token, 
      status, 
      activity, 
      type
    );
    res.json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/execute-command', async (req, res) => {
  try {
    const { command, channelId } = req.body;
    const result = await executeCommand(
      req.session.token, 
      command, 
      channelId
    );
    res.json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/guilds/:guildId/members', async (req, res) => {
  try {
    const members = await getGuildMembers(req.session.token, req.params.guildId);
    res.json(members);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;