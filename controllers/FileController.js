
const express = require('express');
const router = express.Router();
const fs = require('fs');

const File = require('../models/File');
const { default: mongoose } = require('mongoose');

module.exports = function (upload) {

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

      const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

      res.status(201).json({ message: 'File uploaded successfully.', publicUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const files = await File.find({});
      res.status(200).json({ data: files, message: "Files Fetched Successfully!" })
    }
    catch (err) {
      res.status(500).json({ message: "Server Error" })
    }
  });

  router.delete('/:_id', async (req, res) => {
    try {
      const _id = req.params._id;

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

  router.get('/:code', async (req, res) => {
    try {
      const { code } = req.params;
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
