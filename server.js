// 1) - In this file we save the Database configuration, error handling, and environment variables.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Error handling uncaughtException
process.on('uncaughtException', (err) => {
  console.log('UNCAUGH TEXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  //Last safety net. A vary graceful way to shutdown the server. 0 - Success/ 1 - Uncaught Exception
  process.exit(1);
});
dotenv.config({ path: './config.env' }); // Read.env file and save variables into node.js environment variables.
// First read file and then require('./app');
const app = require('./app');

// console.log(app.get('env'));//The environment variable, we used to difine the environment in which a node app is running. Set by Express.
// console.log(process.env); //The environment variable by node.js
// 2) - Connect to database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', false);
mongoose.connect(DB, {}).then((con) => {
  // console.log(con.connections); // View all variables that used to connect
  console.log('Database connected'); //Check if the database is connected
});

// 3) - Start server. Set port number for server to listen on
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Error handling unhandledRejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  //A vary graceful way to shutdown the server. 0 - Success/ 1 - Uncaught Exception
  //Last safety net
  server.close(() => {
    process.exit(1);
  });
});
