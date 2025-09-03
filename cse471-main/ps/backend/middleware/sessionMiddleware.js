const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = {
  sessionMiddleware: session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://petsphere:123@petsphere.tgznjun.mongodb.net/petsphere?retryWrites=true&w=majority&appName=petsphere'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
      sameSite: 'none'
    }
  })
};
