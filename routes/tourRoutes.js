//Routing refers to how an application’s endpoints (URIs) respond to client requests.
const express = require('express');
const tourController = require('./../controllers/tourController');
//const {getAllTours} = require('./../controllers/tourController'); Alternative of tourController Object

const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
