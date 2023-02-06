/* 1) Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
// Require the 'fs' and 'express' modules
// const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Manipulate the query object. This code is an Express middleware function that modifies the request query object.
exports.bestTopTours = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
/* // 2) Testing local database. Read the tours data from the file system and parse it into a JavaScript object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

/* 3) The parameter is called 'id' and when it is used in a request, 
the console will log the value of 'val' (the value of the 'id' parameter) */
/* exports.checkID = (req, res, next, val) => {
  console.log(`Tour ID is : ${val}`); //ID val in  Middleware
  if (req.params.id * 1 > tours.length) {
    // Trick, convert string to number
    // Check if id > tours.length
    // if (!trour) This is same as if (id > tours.length) but written after Search tour id!!!
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }
  next();
}; */

/* 4) This code is a middleware function that checks the body of an incoming request for the presence of both a 'name' and 'price' field. 
If either field is missing, it will return a 400 status response with an error message. 
If both fields are present, it will call the next() function to continue with the request. */
/* exports.CheckBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
}; */

// 5) Route Handlers. Create a GET route to retrieve all tours from the tours object
exports.getAllTours = catchAsync(async (req, res, next) => {
  // 5.5) Execute the query
  // Create an Object of the API features class to query a database for Tour documents.
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fieldsLimit()
    .pagination();
  const tours = await features.query;

  // 5.6) Send response
  res.status(200).json({
    statusbar: 'success',
    // requestedAt: req.requestTime, //Information for users when the request happened
    // Also Testing local database
    results: tours.length,
    data: {
      tours,
    },
  });
});

// Create a GET route to retrieve a single tour from the tours object by using  id
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id: req.params.id}); // Alternative findById

  // We implement this because, we have two different response if the tour is not found.
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    statusbar: 'success',
    data: {
      tour,
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

// Create a POST route to add new tour to the tours object
exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({})
  // newTour.save() //Call metond on new document
  //Call metod directory on the tour object
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    statusbar: 'success',
    data: {
      tour: newTour,
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

// Create a PATCH route to update tour to the tours object
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // true to return modified document rather than original
    // If document does not contain all of the fields specified in the schema, the missing fields will be populated with their default values.
    runValidators: true, // Each time that we update the document, then the validators will run again!
  });
  // We implement this because, we have two different response if the tour is not found.
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    statusbar: 'success',
    data: {
      tour,
    },
  });
});

// Create a DELETE route to delete tour to the tours object
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  // We implement this because, we have two different response if the tour is not found.
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    statusbar: 'success',
    data: null, // nuul - Simpli to show that the tour was deleted and no loger exists
  });
});

exports.getTourStatistics = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // Aggregation pipeline in MongoDB
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //'$ratingsAverage'
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {  We cannot match multiples times in MongoDB
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  res.status(200).json({
    statusbar: 'success',
    data: {
      stats,
    },
  });
});

// Count how many tours there are for each of the mounths in a given year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      // Deconstructs the startDates array field from the input documents and creates a new document for each element.
      $unwind: '$startDates',
    },
    {
      // Filters the documents to include only those with startDates that are greater than or equal to the first day of we specified
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // Groups documents by month and calculates the number of tour starts for each month
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      // Add months fields in results 🧐
      $addFields: { month: '$_id' },
    },
    {
      // _id field should be excluded from the query results.
      $project: {
        _id: 0,
      },
    },
    {
      //It sorts the results of the query in descending order based on the value of the field
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    statusbar: 'success',
    data: {
      plan,
    },
  });
});
