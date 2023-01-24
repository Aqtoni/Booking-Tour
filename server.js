//In this file we save the Database configuration, error handling, and environment variables.
const app = require('./app');
// 4) - Start server. Set port number for server to listen on
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
