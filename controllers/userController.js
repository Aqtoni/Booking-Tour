/* Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// Loop through all the fields in the user model, and check if it's a allowed field, and add in newObj.
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    //The allowedFields is an array of strings that represent the keys that should be included in the new object.
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get document based on user ID. We don't have to pass in any ID as URL parameters.
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; // This allows for the user's id to be accessed and used in other parts API
  next();
};

// 1) Route Handlers.
// Update authenticated user profile
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email'); // Field names that are allowed to be updated
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Deleting users. Update users account condition
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//A GET route to retrieve all User from the User object
exports.getAllUsers = factory.getAll(User);
// A GET route to retrieve a single User from the Users object by using  id
exports.getUser = factory.getOne(User);
// A POST route to add new User to the Users object
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /SignUp instead.',
  });
};
// A PATCH route to update User to the Users object
exports.updateUser = factory.updateOne(User); // Update data is only for admistration. Update data that is not for password updates.
// A DELETE route to delete User to the Users object
exports.deleteUser = factory.deleteOne(User); // Delete user from the database can only admistration
