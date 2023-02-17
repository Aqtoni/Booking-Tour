//Passing operational asynchronous errors into a global error handling middleware.
const AppError = require('./../utils/appError');

// Transforms error messages from Mangoose into operational error
const handleCastErrorDB = (err) => {
  // Sends a Invalid id for users in production
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// This error was called by MongoDB driver!
const handleDuplicateFieldsDB = (err) => {
  // Sends a duplicate field "Duplicate-name" for user in production
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Sends a ValidationError message. Extracted from the error message on our tourSchema.
const handleValidationErrorDB = (err) => {
  //Looping through all message objects, extracting the message into a new array
  const errors = Object.values(err.errors).map((el) => el.message);
  // There may be several errors at the same time. Need to separate messages.
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle errors related to invalid JWT tokens.
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// Handle errors related to expired JSON Web Tokens (JWTs).
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Error we sent when we in Development
const sendErrorDev = (err, req, res) => {
  //A) Error in API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //B) Render the error page
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// Error we sent when we in Production
const sendErrorProd = (err, req, res) => {
  // Error in API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details to client
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) Render the error page.
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Send the different types of errors to the client
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
