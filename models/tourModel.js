//1) - Create a model from the schema.
const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel'); // Need for EMBEDDING
const validator = require('validator');
//Specify a schena for our data. Schema type options for each field.
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String, // Type of dara we want go as a name
      required: [true, 'Anton! Please add a tour name'], // Validator. Specify a required error that will be displayed. Wen we missed this field
      unique: true, //Unique name of the tour
      trim: true, // Trim will remove white spaces from the end of the string.
      maxlength: [50, 'A tour name must have less or equal then 50 characters'], // Maximum and minimum length of the tour name
      minlength: [7, 'A tour name must have more or equal then 7 characters'], // This work in creating and updating a tour
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // This check tour name
    },
    slug: String,
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
      // enum work only with strings
      enum: {
        values: ['easy', 'medium', 'difficult'], // The user can choose only between easy, medium and difficult
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, // If we do not specify, all tour automatically set a 4.5 stars.
      min: [1, 'Rating must be above 1.0'], // The user can choose only between 1.0 and 5.0
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Anton, a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Work only on NEW creation document, because this only points to current doc
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price', // Access a VALUE, implementation Mangoose not JS.
      },
    },
    // Description of the tour
    description: {
      type: String,
      trim: true,
    },
    //Image on the overview page
    imageCover: {
      type: String, // Path to the image on the our file system
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
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // Can be implemented in the location as a day 0.
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // Longitude first, then second the latitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, // Start day of the tour
      },
    ],
    guides: [
      // Put user guides in the tour
      {
        type: mongoose.Schema.ObjectId, // Type of the guide is ObjectId
        ref: 'User', // Reference to the user
      },
    ],
  },
  {
    // Virtual Properties
    /* This code is setting up virtual properties for the object. 
    Virtual properties are not stored in the database, but they can be used to access or set values that are derived from other values. 
    In this case, the code is setting up virtual properties for both the toJSON and toObject methods. 
    This means that when these methods are called, any virtual properties will be included in the output.  */
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// This allows for the duration of the tour to be expressed in weeks instead of days.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate Tours and Reviews / Before we set popular will show null.
tourSchema.virtual('reviews', {
  ref: 'Review', // Name of the model that we want to reference.
  foreignField: 'tour', // Referenced tour on reviewSchema, witch contains two fields
  localField: '_id', // Specify where the id is located. Simple is tour id
});

// MIDDLEWARE DOCUMENT : runs before .save() and .create()
// The code uses the pre-save hook to automatically generate a slug from the tour's name before it is saved in the database.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* // EMBEDDING Put the user in the array of guides 
tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}); */

// Hook is called before the document is saved to the database
// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// Hook is called after the document is saved to the database
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: for the tourSchema
// This function shows Secret Tours.
// We use regular expressions that will look for all methods that start with find.
// If we search without this check, it will show a secret tour
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre(/'find', function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// Add a guide to the all tour
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', // Delete the field from the response
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  //console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE: same functionality as Query middleware. We hiding secretTours in aggregation.
tourSchema.pre('aggregate', function (next) {
  // Adds the filter criteria to the beginning of the pipeline.
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

// Mongoose model called 'Tour' that is based on the tourSchema
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
