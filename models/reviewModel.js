const mongoose = require('mongoose');

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

// Shows the referenced tour and user fields on the reviewSchema
reviewSchema.pre(/^find/, function (next) {
  /* TURNED OFF because that was creating an inefficient chain of populates
 this.populate({
    path: 'tour', // Referenced tour on reviewSchema, witch contains two fields
    select: 'name', // Delete the field from the response
  }).populate({
    path: 'user', // Referenced user on reviewSchema, witch contains two fields
    select: 'name photo', // We onlly send relevant data about the user, name and photo.
  }); */

  this.populate({
    path: 'user', // Referenced user on reviewSchema, witch contains two fields
    select: 'name photo', // We onlly send relevant data about the user, name and photo.
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
