//1) - Create a model from the schema.
const mongoose = require('mongoose');

//Specify a schena for our data. Schema type options for each field.
const tourSchema = new mongoose.Schema({
  name: {
    type: String, // Type of dara we want go as a name
    required: [true, 'Anton! Please add a tour name'], // Validator. Specify a required error that will be displayed. Wen we missed this field
    unique: true, //Unique name of the tour
    trim: true, // Trim will remove white spaces from the end of the string.
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  // Maximum people that a tour can host
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5, // If we do not specify, all tour automatically set a 4.5 stars.
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Anton, a tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, // Trim will remove white spaces from the end of the string.
    required: [true, 'A tour must have a description'],
  },
  // Description of the tour
  description: {
    type: String,
    trim: true,
  },
  //Image on the overview page
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  // createdAt Basically a timestamp. Set the time that user gets a new tour.
  createdAt: {
    type: Date,
    default: Date.now(),
    //select: false, // Hide the field for user
  },
  // Starting date of the tour
  startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
// Model

/* This code creates a Mongoose schema and model for a Tour object. 
The schema defines the fields that will be included in the Tour object, such as name, rating, and price. 
It also specifies the data type for each field and any validation rules that should be applied to the field. 
The model is then created using the schema, which allows us to create Tour objects using Mongoose.
 */

// Testing add tour at database
/* const testTour = new Tour({
  name: 'Test Tour',
  rating: 4.7,
  price: 987,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('Error: ', err);
  }); */
