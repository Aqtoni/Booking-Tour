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
// Error we sent when we in Development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// Error we sent when we in Production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details to client
  } else {
    // 1) Log error
    console.error('ERROR 💥🤞', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Send the different types of errors to the client
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //let error = { ...err };    // Hard code error message but don't work.
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    sendErrorProd(err, res);
  }
};
/* This sends relevant err messages back to the client depending on the type err that occurred.
 The function logs the error stack and sets the statusCode and status of the error.
 It then checks the environment and sends either a development or production error to the client. */
