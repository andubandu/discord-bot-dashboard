import express from 'express';
import { validateToken } from '../controllers/authController.js';

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.token) {
    return res.redirect('/dashboard');
  }
  res.render('index', { 
    title: 'Discord Bot Dashboard - Login',
    error: req.query.error 
  });
});

router.post('/connect', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.redirect('/?error=Token is required');
  }
  
  try {
    const userData = await validateToken(token);
    
    req.session.token = token;
    req.session.user = userData;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error.message);
    res.redirect(`/?error=${encodeURIComponent('Invalid token. Please check and try again.')}`);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/');
});

export default router;