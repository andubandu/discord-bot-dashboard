import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { 
  getDashboardData,
  getGuilds,
  getChannels,
  getGuildMembers
} from '../controllers/botController.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  try {
    const dashboardData = await getDashboardData(req.session.token);
    res.render('dashboard', { 
      title: 'Bot Dashboard', 
      data: dashboardData 
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', { 
      message: 'Failed to load dashboard data', 
      error 
    });
  }
});

router.get('/guilds/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;
    const guildData = await getGuilds(req.session.token, guildId);
    const channels = await getChannels(req.session.token, guildId);
    
    res.render('guild', { 
      title: `Guild: ${guildData.name}`, 
      guild: guildData,
      channels
    });
  } catch (error) {
    console.error('Guild view error:', error);
    res.render('error', { 
      message: 'Failed to load guild data', 
      error 
    });
  }
});

router.get('/guilds/:guildId/channels/:channelId', async (req, res) => {
  try {
    const { guildId, channelId } = req.params;
    const guildData = await getGuilds(req.session.token, guildId);
    const channels = await getChannels(req.session.token, guildId);
    
    res.render('channel', { 
      title: 'Channel View', 
      guild: guildData,
      channels,
      currentChannelId: channelId
    });
  } catch (error) {
    console.error('Channel view error:', error);
    res.render('error', { 
      message: 'Failed to load channel data', 
      error 
    });
  }
});

router.get('/guilds/:guildId/members', async (req, res) => {
  try {
    const { guildId } = req.params;
    const guildData = await getGuilds(req.session.token, guildId);
    const members = await getGuildMembers(req.session.token, guildId);
    
    res.render('members', { 
      title: `Members - ${guildData.name}`, 
      guild: guildData,
      members
    });
  } catch (error) {
    console.error('Members view error:', error);
    res.render('error', { 
      message: 'Failed to load members data', 
      error 
    });
  }
});

router.get('/settings', (req, res) => {
  res.render('settings', { 
    title: 'Bot Settings'
  });
});

export default router;