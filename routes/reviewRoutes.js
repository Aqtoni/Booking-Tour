const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });
/* By default, each route only have access to the perameters of their specific routes. 
POST /tour/233asrf/reviews - Will be working, mergeParams get access to this ID, which comes from the outher router before */

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
