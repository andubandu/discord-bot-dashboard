import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import indexRoutes from './routes/index.js';
import dashboardRoutes from './routes/dashboard.js';
import apiRoutes from './routes/api.js';
import { setupSocketEvents } from './utils/socketManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'discord-bot-dashboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.token;
  next();
});

app.use('/', indexRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);

setupSocketEvents(io);

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});