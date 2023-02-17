const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cokieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Sets the view engine to pug and sets the views directory
app.set('view engine', 'pug');
// Node automatically create a correct path. Method is used to join together two or more path segments into a single path
app.set('views', path.join(__dirname, 'views'));

//1) Global Middleware
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
/* It tells the application to use the "express.static" middleware, 
which is used to serve static files (such as images, CSS, and JavaScript files). 
The argument passed to the middleware is a path to the public directory in the current directory (__dirname). 
This allows the application to serve static files from that directory.
*/

// Set security HTTP headers
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     crossOriginEmbedderPolicy: false,
//   })
// );

// Create an Express application and use the json middleware
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
// Sets the body-parser middleware to accept URL encoded data with an extended syntax. Simply get data from user input in acc settings
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cokieParser());

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

//Magic of Middleware 1 Order matters
// app.use((req, res, next) => {
// console.log("Hello from the middleware!🦀");
// next();
// });

// Test middleware. Information when the request happened
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  // console.log(req.headers);
  next();
});

// 3) Routes. When there is a request, the middleware function is called.
app.use('/', viewRouter);
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
