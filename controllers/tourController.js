/* 1) Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
// Require the 'fs' and 'express' modules
// const fs = require('fs');
const Tour = require('./../models/tourModel');

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
exports.getAllTours = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query }; // Hard copy or safe object
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    //console.log(req.requestTime); //Information when the request happened
    /* console.log(req.query, queryObj);  The query string is a set of key-value pairs sent in the URL of an HTTP request. 
    It is used to pass additional information to the server, such as search terms or other parameters. */

    // Advanced filtering MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    /* Filter option 1   
  const tours = await Tour.find({
      duration: '5',
      difficulty: 'easy',
    }); */

    /* Filter option 2
    const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy'); */

    // Sorting  the query based on the value of req.query.sort
    if (req.query.sort) {
      const sotrBy = req.query.sort.split(',').join(' ');
      query = query.sort(req.query.sort); // Value of the field in this case "price"
      // sort('price raingsAverage');
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting checking the query string for a field parameter
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    // Pagination
    const page = req.query.page * 1 || 1; // Convert string to number
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=3&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page is not available');
    }
    // Execute the query
    const tours = await query;
    res.status(200).json({
      statusbar: 'success',
      // requestedAt: req.requestTime, //Information for users when the request happened
      // Also Testing local database
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      statusbar: 'fail',
      message: err,
    });
  }
};

// Create a GET route to retrieve a single tour from the tours object by using  id
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id: req.params.id}); // Alternative findById
    res.status(200).json({
      statusbar: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      statusbar: 'fail',
      message: err,
    });
  }
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
};

// Create a POST route to add new tour to the tours object
exports.createTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      statusbar: 'fail',
      message: err,
    });
  }
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
};

// Create a PATCH route to update tour to the tours object
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // true to return modified document rather than original
      setDefaultsOnInsert: true, // Each time that we update the document, then the validators will run again!
    });
    res.status(200).json({
      statusbar: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      statusbar: 'fail',
      message: err,
    });
  }
};

// Create a DELETE route to delete tour to the tours object
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      statusbar: 'success',
      data: null, // nuul - Simpli to show that the tour was deleted and no loger exists
    });
  } catch (err) {
    res.status(404).json({
      statusbar: 'fail',
      message: err,
    });
  }
};
