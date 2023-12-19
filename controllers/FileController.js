// controllers/FileController.js

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

const File = require('../models/File');

module.exports = function (upload) {
  // Route to handle file uploads
  router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const { originalname, filename } = req.file;
      function generateRandomCode() {
        return Math.floor(100000 + Math.random() * 900000);
      }
      const match = filename.match(/^\d{6}/);
      console.log("code", match);
  
      // Save file details to the database
      const newFile = new File({
        originalname,
        filename,
        uniqueCode: generateRandomCode(), // Extract unique code from the filename
      });
  
      await newFile.save();
  
      res.status(201).json({ message: 'File uploaded successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/download/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Assuming the 'path' property in the File model contains the file path
        const filePath = file.path;

        // Check if the file exists
        const exists = await fs.access(filePath)
            .then(() => true)
            .catch(() => false);

        if (!exists) {
            return res.status(404).json({ message: "File not found" });
        }

        // Set the appropriate headers for the response
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
        res.setHeader('Content-Type', 'image/jpeg'); // Adjust the content type based on your file type

        // Create a read stream from the file and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

  router.get('/', async (req, res) => {
    try{
        const files = await File.find({});
        res.status(200).json({data:files, message: "Files Fetched Successfully!"})
    }
    catch(err){
        res.status(500).json({message: "Server Error"})
    }
});

router.delete('/:_id', async (req, res) => {
  try {
    const _id = req.params._id;

    // Check if the fileId is a valid ObjectId (assuming you're using MongoDB)
    // if (!isValidObjectId(fileId)) {
    //   return res.status(400).json({ message: 'Invalid file ID' });
    // }

    // Find and delete the file by ID
    console.log(_id);
    const deletedFile = await File.findByIdAndDelete(_id);

    if (!deletedFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ data: deletedFile, message: 'File Deleted Successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

function isValidObjectId(id) {
  const ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId.isValid(id) && new ObjectId(id) == id;
}
  

  // Route to retrieve a file by its unique code
  router.get('/:code', async (req, res) => {
    try {
      const { code } = req.params;

      // Find file details by unique code
      const file = await File.findOne({ uniqueCode: code });

      if (!file) {
        return res.status(404).json({ error: 'File not found.' });
      }

      const filePath = `uploads/${file.filename}`;

      // Check if the file exists on the file system
      if (fs.existsSync(filePath)) {
        res.download(filePath, file.originalname);
      } else {
        res.status(404).json({ error: 'File not found on the server.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
