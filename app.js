// Require the 'fs' and 'express' modules
const fs = require('fs');
const express = require('express');

// Create an Express application and use the json middleware
const app = express();
app.use(express.json());

// Read the tours data from the file system and parse it into a JavaScript object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Create a GET route to retrieve all tours from the tours object
const getAllTours = (req, res) => {
  res.status(200).json({
    statusbar: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

// Create a GET route to retrieve a single tour from the tours object by using lits id
const getTour = (req, res) => {
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

// Create a POST route to add new tour to the tours object
const createTour = (req, res) => {
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
const updateTour = (req, res) => {
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

// Create a DELETE route to delete tour to the tours object
const deleteTour = (req, res) => {
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

// app.get('/api/v1/tours');
// app.get('/api/v1/tours/:id');
// app.post('/api/v1/tours');
// app.patch('/api/v1/tours/:id');
// app.delete('/api/v1/tours/:id');

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// set port number for server to listen on
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
