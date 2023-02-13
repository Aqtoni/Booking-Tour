const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
//const catchAsync = require('./../utils/catchAsync');

// A GET route to all reviews tour to the reviews object
exports.getAllReviews = factory.getAll(Review);

// Middleware function that sets the tour and user ids for a request.
exports.setTourUserId = (req, res, next) => {
  // Allow nested routes. Users can still manually specify the tour and user id. We simply define them, when they are not here (specify).
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// A POST route to add new reviews tour to the reviews object
exports.createReview = factory.createOne(Review);
// A GET route to review tour to the reviews object
exports.getReview = factory.getOne(Review);
// A PATCH route to update reviews tour to the reviews object
exports.updateReview = factory.updateOne(Review);
// A DELETE route to delete reviews tour to the reviews object
exports.deleteReview = factory.deleteOne(Review);
