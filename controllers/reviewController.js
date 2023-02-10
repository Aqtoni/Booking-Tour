const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

// Get the all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId }; // Review where the tour matches the Id are going found.

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

// Create a review
exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes. Users can still manually specify the tour and user id. We simply define them, when they are not here (specify).
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReviews = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    result: newReviews.length,
    data: {
      review: newReviews,
    },
  });
});

// Get the reviews
exports.getReview;
exports.updateReview;
exports.deleteReview;
