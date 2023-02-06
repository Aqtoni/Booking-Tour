//This code creates a class called AppError which extends the Error class.
class AppError extends Error {
  constructor(message, statusCode) {
    // The super method is used to call the parent class' constructor with the message parameter.
    super(message);
    /* The statusCode is set as an attribute of the AppError instance, 
    and the status attribute is set to either 'fail' or 'error' depending on if the statusCode starts with a 4 or not. */
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // All errors that we create ourselves will basically be operational errors.
    this.isOperational = true;
    // Stack track, capture errors and show us where the error happened
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError; 