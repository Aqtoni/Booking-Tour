const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// A DELETE route to delete Object to the Object Model (tour, users, reviews)
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    // We implement this because, we have two different response if the object is not found.
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null, //nuul - Simpli to show that the tour was deleted and no loger exists
    });
  });

// A PATCH route to update Object to the Object Model (tour, users, reviews)
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // true to return modified document rather than original
      // If document does not contain all of the fields specified in the schema, the missing fields will be populated with their default values.
      runValidators: true, // Each time that we update the document, then the validators will run again!
    });
    // We implement this because, we have two different response if the Object is not found.
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// A POST route to add new Object to the Object Model (tour, users, reviews)
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newTour = new Tour({})
    // newTour.save() //Call metond on new document
    //Call metod directory on the tour object
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    /*  Testing local database
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        statusbar: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  ); */
  });

// A GET route to retrieve a single Object from the Object Model by using id (tour, users, reviews)
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    // Tour.findOne({_id: req.params.id}); // Alternative findById
    if (popOptions) query = query.populate(popOptions); // If we have Populate, we added it to the query
    const doc = await query;
    // We implement this because, we have two different response if the Object is not found.
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    //'/api/v1/tours/:id/:x/:y' = { id: '0', x: '3', y: 'undefined' } ? - Optional parameter
    /*Testing local database 
  const id = req.params.id * 1; // Trick, convert string to number
 const tour = tours.find((tour) => tour.id === id); // Find tour in arr by id
  console.log(req.params);
  res.status(200).json({
    statusbar: 'success',
    data: {
      tour,
    },
  }); */
  });

//A GET route to retrieve all Object from the tours Object Model (tour, users, reviews)
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filters = {};
    if (req.params.tourId) filters = { tour: req.params.tourId }; // Review where the tour matches the Id are going found.
    //  Execute the query. Create an Object of the API features class to query a database for Tour documents.
    const features = new APIFeatures(Model.find(filters), req.query)
      .filter()
      .sort()
      .fieldsLimit()
      .pagination();
    // const doc = await features.query.explain(); // Returns information on the query execution plan
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime, //Information for users when the request happened
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
