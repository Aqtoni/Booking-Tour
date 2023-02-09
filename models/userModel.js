const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//Specify a schena for our users.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true, //Unique email address
    lowercase: true, // lowercase email address
    validate: [validator.isEmail, 'Please provide a valid email'], // Validate email address format.
  },
  photo: String, // Path to the image on the our file system
  role: {
    type: String,
    enum: ['user', 'guide', 'moderator', 'admin'], //All role of the user
    default: 'user', // Default role is user.
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8, // Password must be at least 8 characters.
    select: false, // Don't select the password field. Automatically neber show up in any output.
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Confirm password is actualy the same than the main password
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password; // Password is valid abqw === abqw
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date, // Date the password was changed
  passwordResetToken: String, // Token for password reset
  passwordResetExpires: Date, // Security maasure Date the password was reset or token expires
  active: {
    // Is the user active or not.
    type: Boolean,
    default: true,
    select: false,
  },
});

// Pre-save middleware runs before a user is saved to the database. Between getting the data and saving it to the database.
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 14);
  // After passwordConfirm we delete passwordConfirm field, we don't need it in our database anymore.
  this.passwordConfirm = undefined;
  next();
});

// Update changedPasswordAt property for the user. It is a pre-save hook that runs before a document is saved to the database.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //Ensure that the Token is always created after the password has been changed.
  next();
});

// Finds all documents where the "active" field, does not equal false. Middleware will run before any find
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance Methods
userSchema.methods.correctPassword = async function (
  /*   User passes the original password in the body(no hash), and userPassword(hash) 
  And this.userPassword Don't work because select: false, */
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // Compare the Passwords. True or false.
};

/* The method checks if the user's password has been changed since the JWT was issued.
It first checks if the user has changed their password, and if so, 
it parses the timestamp of when the password was changed and compares it to the given JWTTimestamp. 
If the JWTTimestamp is less than the changedTimestamp, it returns true, otherwise it returns false.*/
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Creates a password reset token for a user
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Create a new reset token for the user.
  /*   Creates a password reset token and then converts it to a hexadecimal string 
  This is used to securely store a user's password reset token in the database. */
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //Expiration date 10 minutes

  return resetToken; // This we send to the client.
};

// Mongoose model called 'User' that is based on the userSchema
const User = mongoose.model('User', userSchema);
module.exports = User;
