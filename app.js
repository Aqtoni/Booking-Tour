const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Middleware. Create an Express application and use the json middleware
console.log(process.env.NODE_ENV); //Check for Development Environment
if(process.env.NODE_ENV === 'development'){ //We Check for Development Environment
app.use(morgan('dev')); // HTTP request logger
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
/* It tells the application to use the "express.static" middleware, 
which is used to serve static files (such as images, CSS, and JavaScript files). 
The argument passed to the middleware is a path to the public directory in the current directory (__dirname). 
This allows the application to serve static files from that directory.
*/

//Magic of Middleware 1 Order matters
// app.use((req, res, next) => {
// console.log("Hello from the middleware!🦀");
// next();
// });

//Information when the request happened
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
//Magic of Middleware 2 Order matters
// app.use((req, res, next) => {
// console.log("Hello from the middleware!🦀");
// next();
// });

module.exports = app;
