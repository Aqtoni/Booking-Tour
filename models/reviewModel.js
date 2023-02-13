const mongoose = require('mongoose');
const Tour = require('./tourModel');

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }, // Parant referencing tour and user
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Meaning that there can only be one review for each tour from each user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Shows the referenced tour and user fields on the reviewSchema
reviewSchema.pre(/^find/, function (next) {
  /* TURNED OFF because that was creating an inefficient chain of populates
 this.populate({
    path: 'tour', // Referenced tour on reviewSchema, witch contains two fields
    select: 'name', // Delete the field from the response
  }).populate({
    path: 'user', // Referenced user on reviewSchema, witch contains two fields
    select: 'name photo', // We only send relevant data about the user, name and photo.
  }); */

  this.populate({
    path: 'user', // Referenced user on reviewSchema, witch contains two fields
    select: 'name photo', // We only send relevant data about the user, name and photo.
  });
  next();
});

// We calculate the Average-Rating and Ratings-Quantity for each review, and save it to the DB.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, // Passing a filter Object
    },
    {
      $group: {
        // Group Object
        _id: '$tour',
        nRating: { $sum: 1 }, // Adds 1 to the each document in the collection
        avgRating: { $avg: '$rating' }, // Calculates the average rating of a document or group of documents.
      },
    },
  ]);
  // console.log(stats);

  // Save the result to the database
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    //If the Tour has no comments or the last comment is removed, this is assigned to the tour by default
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0, // Set default when there are no reviews
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  //Review.calcAverageRatings(this.tour); This doesn't work, because it undefined.
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete

/* QUERY MIDDLEWARE Goal is to get access to the current review document. But here the "this" is the current query. 
We are going to go around this, and basically execute the query. And then that will give us the document that's currently processed. */
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  // console.log(this.r);
  next();
});

// Actual here we calculate the statistics for review.
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour); // calling  method and passing in the tour ID from the fetched review document.
});
/* This code is part of a Mongoose schema for reviews. 
It calculates the average rating and number of ratings for a tour, and updates the Tour model with this information. 
The first function (calcAverageRatings) is called after a review is saved, and it takes the tour ID as an argument. 
It uses MongoDB's aggregate method to match reviews with the given tour ID, 
then groups them by tour and sums the number of ratings and averages the rating. 
If there are any stats, it updates the Tour model with the quantity and average rating, otherwise it sets them to 0 and 4.5 respectively. 
The two other functions are middleware functions that are triggered before or after a query is made on a review document. 
The pre-query function finds one review document that matches the query, 
while the post-query function calls calcAverageRatings with the tour ID from that review document. */
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
