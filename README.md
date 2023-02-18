# Booking-Tours Application 🚵‍♂️🎋

Realistic nature-touring web app made for fun. Sign up or log in, book a tour update your profile, make payment with your credit card (don't be afraid to try it, you won't loose a peny 😉) and do much more. 🌎🚣‍♀️
I built this app with a great teacher <a href="https://github.com/jonasschmedtmann" target="_blank"> Jonas Schmedtmann </a> using modern technologies: node.js, express, mongoDB, mongoose. And handling a lot of modern bugs, which appeared from different versions, but still, this was a great challenge for me. 🤒🤯 
There are many comments in the project, I made them for myself, but I decided to leave them for the public, as they will help newcomers and others to understand better. 🥸

## Deployed Version

Live demo (Feel free to visit) 👉 : https://lgope-natours.onrender.com/

## Key Features

- Authentication and Authorization
  - Login and logout
- Tour
  - Manage booking, check tours map, check users' reviews and rating
- User profile
  - Update username, photo, email, and password
- Credit card Payment

## Installation

You can fork the app or you can git-clone the app into your local machine. Once done that, please install all the
dependencies by running

```
$ npm i
set your env variables
$ npm run watch:js
$ npm run build:js
$ npm run start:dev (for development)
$ npm run start:prod (for production)
$ npm run debug (for debug)
```

## API Usage

Before using the API, you need to set the variables in Postman depending on your environment (development or production). Simply add:

```
- {{URL}} with your hostname as value (Eg. http://127.0.0.1:3000 or other)
- {{password}} with your user password as value.
```

Check [Natours-Tours API Documentation](https://documenter.getpostman.com/view/25263444/2s93CHuFMr) for more info.

## Build With

- [NodeJS](https://nodejs.org/en/) - JS runtime environment
- [Express](http://expressjs.com/) - The web framework used
- [Mongoose](https://mongoosejs.com/) - Object Data Modelling (ODM) library
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database service
- [Pug](https://pugjs.org/api/getting-started.html) - High performance template engine
- [JSON Web Token](https://jwt.io/) - Security token
- [ParcelJS](https://parceljs.org/) - Blazing fast, zero configuration web application bundler
- [Stripe](https://stripe.com/) - Online payment API
- [Postman](https://www.getpostman.com/) - API testing
- [Mailtrap](https://mailtrap.io/) & [Sendgrid](https://sendgrid.com/) - Email delivery platform

# File Layout

- Folder: controllers - Contains controllers pertaining to authorization, bookings, error handling, database requests, reviews, tours, users, and page views.
- Folder: dev-data -Contains starter files for development (images, database content, view templates) as well as scripts created for importing data from file to our remote database.
- Folder: models - Contains object models for bookings, reviews, tours, and users.
- Folder: public - Contains bundled javascript files, images and css available outside of the application. Also contains html files referenced during creation of pug files.
- Folder: routes - Contains files defining routes and access authorization to those routes pertaining to bookings, reviews, tours, users, and page views.
- Folder: utils - Contains helper files pertaining to API features, e-mail functions, application errors.
- Folder: views - Contains files written with pug that provide our user interface.

# Tech Stack Description

- node.js - Server side scripting and web server creation.
- express.js - API construction.
- mongoose.js - MongoDB object modeling for Node.js.
- mongodb atlas - Hosted remote database.
- pug - Server side rendering for user interface.
- stripe - Payment service.
- sendinblue - Used to exchange transactional emails with customers.
- heroku - Hosts our production ready application.
- express mongo sanitize - Aids in preventing mongo injection queries.
- express rate limit - Limits repeated requests to public APIs and/or endpoints.
- babel polyfill - Backwards browser compatibility
- axios - Promise based HTTP client for Node.js.
- bcrypt.js - Hashed and salted password encryption.
- compression - Middleware used to compress response bodies.
- cookie-parser - Parse HTTP request cookies. Used as part of dynamic logging during development.
- cors - Cross Origin Resource Sharing middleware.
- dotenv - Used in securing environment variables before deployment to Heroku.
- helmet - HTTP header customization .
- hpp - Protects against HTTP parameter pollution.
- jsonwebtoken - Allows customization of jwt usage.
- morgan - Request logging utilized in development.
- terser - Allows for multiple input files, used in uploading multiple images as part of creating a tour object.
- multer - Adds a body object and a file or files object to the request object.
- sharp - Image processing for Node.js
- validator - Validation for mongodb document fields.
- xss-clean - User request sanitizer.
