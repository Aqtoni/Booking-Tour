//1) - Routing refers to how an application’s endpoints (URIs) respond to client requests.
const express = require('express');
const userController = require('./../controllers/userController');
//const {getAllUser} = require('./../controllers/userController'); Alternative of userController Object

const router = express.Router();

router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
