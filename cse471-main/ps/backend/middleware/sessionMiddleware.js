
const session = require('express-session');
const MongoStore = require('connect-mongo');

const SESSION_SECRET = process.env.SESSION_SECRET || 'defaultSecretKey';
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://petsphere:123@petsphere.tgznjun.mongodb.net/petsphere?retryWrites=true&w=majority&appName=petsphere';

module.exports = {
  sessionMiddleware: session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
};
