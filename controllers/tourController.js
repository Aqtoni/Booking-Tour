/* 1) Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
// Require the 'fs' and 'express' modules
// const fs = require('fs');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

// Manipulate the query object. This code is an Express middleware function that modifies the request query object.
exports.bestTopTours = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// A GET route to retrieve all tours from the tours object
exports.getAllTours = factory.getAll(Tour);
// A GET route to retrieve a single tour from the tours object by using  id
exports.getTour = factory.getOne(Tour, {
  path: 'reviews', // Also we can specify select
}); // Include a populated field 'reviews'
// A POST route to add new tour to the tours object
exports.createTour = factory.createOne(Tour);
// A PATCH route to update tour to the tours object
exports.updateTour = factory.updateOne(Tour);
// A DELETE route to delete tour to the tours object
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStatistics = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // Aggregation pipeline in MongoDB
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // Filter out tours with rating >= 4.5
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //'$ratingsAverage'
        numTours: { $sum: 1 }, // Number of tours
        numRatings: { $sum: '$ratingsQuantity' }, // Number of ratings
        avgRating: { $avg: '$ratingsAverage' }, // Average rating
        avgPrice: { $avg: '$price' }, // Average price
        minPrice: { $min: '$price' }, // Minimum price
        maxPrice: { $max: '$price' }, // Maximum price
      },
    },
    {
      $sort: { avgPrice: 1 }, // Sort by average price
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

// Show how many tours are nearby
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Special unit JSON. Order to get the radians we neet to divide our distance by radius of earth.
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, // First we need to find the latitude and then longitude
  });
  // console.log(distance, latlng, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
/* MongoDB's GeoJSON feature to find all tours that have a start location within a certain radius of a given longitude and latitude. 
It is using the $geoWithin operator with the $centerSphere operator to specify the center point and radius. 
The result will be an array of all tours that have a start location within the specified radius. */

// Show the distance to the starting point of the tour
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        // geoNear Always need to be the first stage
        near: {
          type: 'Point', // GeoJSON type
          coordinates: [lng * 1, lat * 1], // String coordinates converted to number
        },
        distanceField: 'distance', // This field will be created and where all calculated distances will be stored.
        distanceMultiplier: multiplier, // Convert distance meters to kilometers or miles
      },
    },
    {
      // Leave only the distance and name field
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

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
