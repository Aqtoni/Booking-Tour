//Script to import and delete data from the file into the Database
// To run this script print node impotr-dev-data.js --import or --delete
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './../../config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.set('strictQuery', false);
mongoose.connect(DB, {}).then((con) => {
  console.log('Database connected');
});

// Read JSON file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

// Import data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from DB

const deleteData = async () => {
  try {
    await Tour.deleteMany(); // Metod delete all data it collection
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  // A very abrupt way the shutdown server.
  process.exit();
};

// console.log(process.argv); // Process arguments

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

/* This code requires the fs, mongoose, and dotenv modules. 
It configures dotenv with the path to the config file, connects to a MongoDB database using the credentials from the config file, 
and then reads a JSON file containing tour data. 
It then provides two functions for importing or deleting that data from the database. 
The code also checks for command line arguments to determine which function should be executed. */
