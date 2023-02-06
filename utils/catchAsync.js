/* This allows for error handling in asynchronous functions. 
This code is a function that takes in another function (fn) as an argument. 
It then returns a function that takes in request, response, and next as arguments. 
This returned function calls the fn argument with the request, response, and next arguments, 
and catches any errors with the next argument.  */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
/* This code is creating a middleware function called catchAsync that takes in a function as an argument. 
This middleware function is then used to create an endpoint for creating a tour. 
The catchAsync middleware wraps the async function passed in as an argument, which creates the tour using the request body */