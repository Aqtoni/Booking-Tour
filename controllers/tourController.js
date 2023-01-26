/* Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
// Require the 'fs' and 'express' modules
const fs = require('fs');
// Read the tours data from the file system and parse it into a JavaScript object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

/* The parameter is called 'id' and when it is used in a request, 
the console will log the value of 'val' (the value of the 'id' parameter) */
exports.checkID = (req, res, next, val) => {
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
};

/* This code is a middleware function that checks the body of an incoming request for the presence of both a 'name' and 'price' field. 
If either field is missing, it will return a 400 status response with an error message. 
If both fields are present, it will call the next() function to continue with the request. */
exports.CheckBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

// 2) Route Handlers. Create a GET route to retrieve all tours from the tours object
exports.getAllTours = (req, res) => {
  console.log(req.requestTime); //Information when the request happened
  res.status(200).json({
    statusbar: 'success',
    requestedAt: req.requestTime, //Information for users when the request happened
    results: tours.length,
    data: {
      tours,
    },
  });
};

// Create a GET route to retrieve a single tour from the tours object by using  id
exports.getTour = (req, res) => {
  //'/api/v1/tours/:id/:x/:y' = { id: '0', x: '3', y: 'undefined' } ? - Optional parameter
  const id = req.params.id * 1; // Trick, convert string to number

  const tour = tours.find((tour) => tour.id === id); // Find tour in arr by id
  console.log(req.params);
  res.status(200).json({
    statusbar: 'success',
    data: {
      tour,
    },
  });
};

// Create a POST route to add new tour to the tours object
exports.createTour = (req, res) => {
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
  );
};

// Create a PATCH route to update tour to the tours object
exports.updateTour = (req, res) => {
  res.status(200).json({
    statusbar: 'success',
    data: {
      tour: '<Update tour here...>',
    },
  });
};

// Create a DELETE route to delete tour to the tours object
exports.deleteTour = (req, res) => {
  res.status(204).json({
    statusbar: 'success',
    data: null, // nuul - Simpli to show that the tour was deleted and no loger exists
  });
};
