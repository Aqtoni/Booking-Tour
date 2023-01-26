//Routing refers to how an application’s endpoints (URIs) respond to client requests.
const express = require('express');
const tourController = require('./../controllers/tourController');
//const {getAllTours} = require('./../controllers/tourController'); Alternative of tourController Object

const router = express.Router();

router.param('id', tourController.checkID); //Param Middleware. Here we could check if the user is logged in or not,
// or if the user has the privileg to access to even write to the database.

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.CheckBody, tourController.createTour); // First check CheckBody then createTour

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
