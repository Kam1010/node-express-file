const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const shortid = require('shortid');
const app = express();
require("dotenv").config();


const port = process.env.PORT;
app.get('/', (req, res) => {
    res.json({ message: "Home Page" })
});

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    const uniqueCode = file.originalname.split('_')[0];
    cb(null, `${uniqueCode}_${file.originalname}`);
  },
});

const upload = multer({ storage });


// Set up routes
const userRoutes = require('./controllers/UserController');
const fileRoutes = require('./controllers/FileController')(upload); // Pass the upload middleware
app.use('/users', userRoutes);
app.use('/files', fileRoutes);

mongoose.connect(process.env.MONGOURI)
    .then((res) => console.log("connected"))
    .catch((err) => console.log("error", err));

app.listen(port, (req, res) => {
    console.log(`server running on port ${port}`);
});