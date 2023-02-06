class APIFeatures {
  // Mongoose query object, Express queryString
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // Hard copy or safe object
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    // Advanced filtering MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sotrBy = this.query.sort.split(',').join(' ');
      this.query = this.query.sort(sotrBy); // Value of the field in this case "price"
      // sort('price raingsAverage');
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fieldsLimit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1; // Convert string to number
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=3&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;

//THIS WAS BEFORE APIFeatures CLASS in file tourController.js

// 5) Route Handlers. Create a GET route to retrieve all tours from the tours object
// exports.getAllTours = async (req, res) => {
//   try {
// 5.1) Filtering
// const queryObj = { ...req.query }; // Hard copy or safe object
// const excludeFields = ['page', 'sort', 'limit', 'fields'];
// excludeFields.forEach((el) => delete queryObj[el]);
//console.log(req.requestTime); //Information when the request happened
/* console.log(req.query, queryObj);  The query string is a set of key-value pairs sent in the URL of an HTTP request. 
    It is used to pass additional information to the server, such as search terms or other parameters. */

// 5.1.1) Advanced filtering MongoDB operators
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

// let query = Tour.find(JSON.parse(queryStr));

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

// 5.2) Sorting  the query based on the value of req.query.sort
// if (req.query.sort) {
//   const sotrBy = req.query.sort.split(',').join(' ');
//   query = query.sort(req.query.sort); // Value of the field in this case "price"
//   // sort('price raingsAverage');
// } else {
//   query = query.sort('-createdAt');
// }

// 5.3) Field limiting checking the query string for a field parameter
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// 5.4) Pagination
// const page = req.query.page * 1 || 1; // Convert string to number
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// // page=3&limit=10, 1-10, page 1, 11-20, page 2, 21-30 page 3
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page is not available');
// }

// 5.5) Execute the query
// Create an Object of the API features class to query a database for Tour documents.
// const features = new APIFeatures(Tour.find(), req.query)
//   .filter()
//   .sort()
//   .fieldsLimit()
//   .pagination();
// const tours = await features.query;

// 5.6) Send response
// res.status(200).json({
//   statusbar: 'success',
// requestedAt: req.requestTime, //Information for users when the request happened
// Also Testing local database
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       statusbar: 'fail',
//       message: err,
//     });
//   }
// };
