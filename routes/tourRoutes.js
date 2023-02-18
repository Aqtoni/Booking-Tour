//1) - Routing refers to how an application’s endpoints (URIs) respond to client requests.
const express = require('express');
const tourController = require('./../controllers/tourController');
//const {getAllTours} = require('./../controllers/tourController'); Alternative of tourController Object
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewsRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//router.param('id', tourController.checkID); //Param Middleware. Here we could check if the user is logged in or not,
// or if the user has the privileg to access to even write to the database.

// Nested Routes v1 - off/just sample, and v2 - working.
/* router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  ); */

router.use('/:tourId/reviews', reviewsRouter); // Started in app on tourRouter a then go here

router
  .route('/top-3-cheap')
  .get(tourController.bestTopTours, tourController.getAllTours);

router.route('/tour-statistics').get(tourController.getTourStatistics);
router
  .route('/mounthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'moderator', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'moderator'),
    tourController.createTour
  );
//.get(catchAsync(tourController.getAllTours)); //Alternative of catchAsync witch we use in tourController because all fn is async
//.post(tourController.CheckBody, tourController.createTour); // First check CheckBody then createTour locally

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'moderator'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'moderator'), // Pass some users roles, which allows deleting your only admin or moderator.
    tourController.deleteTour
  );

module.exports = router;
