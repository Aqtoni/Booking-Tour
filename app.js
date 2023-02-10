const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
// Set security HTTP headers
app.use(helmet());

// 1) Global Middleware. Create an Express application and use the json middleware
console.log(process.env.NODE_ENV); //Check for Development Environment
if (process.env.NODE_ENV === 'development') {
  //We Check for Development Environment
  app.use(morgan('dev')); // HTTP request logger
}

// Limit requests from same API. 100 Requests from the same IP in one hour. If app crashes then limit is reset.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // Use only the API

// Body parser, reading data from body into req.body. If body > 10kb, reject the request
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection {"$gt": ""} 😟
app.use(mongoSanitize());

// Data sanitization against XSS (But it is very old)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
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

// Test middleware. Information when the request happened
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 3) Routes. When there is a request, the middleware function is called.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
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
