//In this file we save the Database configuration, error handling, and environment variables.
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // Read.env file and save variables into node.js environment variables.
// First read file and then require('./app');
const app = require('./app');

// console.log(app.get('env'));//The environment variable, we used to difine the environment in which a node app is running. Set by Express.
// console.log(process.env); //The environment variable by node.js
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', false);
mongoose.connect(DB, {}).then((con) => {
  // console.log(con.connections); // View all variables that used to connect
  console.log('Database connected'); //Check if the database is connected
});
//Connect to database

// 4) - Start server. Set port number for server to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
