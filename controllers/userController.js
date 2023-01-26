/* Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
// 2) Route Handlers. Create a GET route to retrieve all User from the User object
exports.getAllUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// Create a GET route to retrieve a single User from the Users object by using  id
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// Create a POST route to add new User to the Users object
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// Create a PATCH route to update User to the Users object
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// Create a DELETE route to delete User to the Users object
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
