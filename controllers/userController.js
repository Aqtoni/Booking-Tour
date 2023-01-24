/* Controller functions to get the requested data from the models, create an HTML page displaying the data, 
and return it to the user to view in the browser. */
// 2) Route Handlers. Create a GET route to retrieve all User from the User object
exports.getAllUser = (req, res) => {
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

// Create a GET route to retrieve a single User from the Users object by using  id
exports.getUser = (req, res) => {
  //'/api/v1/tours/:id/:x/:y' = { id: '0', x: '3', y: 'undefined' } ? - Optional parameter

  const id = req.params.id * 1; // Trick, convert string to number
  if (id > tours.length) {
    // Check if id > tours.length
    // if (!trour) This is same as if (id > tours.length) but written after Search tour id!!!
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }
  const tour = tours.find((tour) => tour.id === id); // Find tour in arr by id
  console.log(req.params);
  res.status(200).json({
    statusbar: 'success',
    data: {
      tour,
    },
  });
};

// Create a POST route to add new User to the Users object
exports.createUser = (req, res) => {
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

// Create a PATCH route to update User to the Users object
exports.updateUser = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }

  res.status(200).json({
    statusbar: 'success',
    data: {
      tour: '<Update tour here...>',
    },
  });
};

// Create a DELETE route to delete User to the Users object
exports.deleteUser = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Tour not found',
    });
  }

  res.status(204).json({
    statusbar: 'success',
    data: null, // nuul - Simpli to show that the tour was deleted and no loger exists
  });
};
