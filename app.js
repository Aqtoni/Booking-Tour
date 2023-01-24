const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();
// 1) Middleware. Create an Express application and use the json middleware
app.use(morgan('dev')); // HTTP request logger
app.use(express.json());
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
