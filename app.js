const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Middleware. Create an Express application and use the json middleware
console.log(process.env.NODE_ENV); //Check for Development Environment
if (process.env.NODE_ENV === 'development') {
  //We Check for Development Environment
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
  // console.log(req.headers);
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

// It is a catch-all route that will handle any request made to the server, regardless of the HTTP method or path.
// This results in a request to url which does not exist
// ALWAYS WRITTEN AT THE END AFTER ALL ROUTES!
app.all('*', (req, res, next) => {
  /*  Old versions before creating a class.
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err); */
  //If we pass something to the next, the express thinks it's an error. Next will skip all other middleware.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
