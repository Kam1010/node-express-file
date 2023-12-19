const express = require("express");
const router = express.Router();
const {handleGetAllUsers, handleAddAllUsers} = require("../controllers/UserController.js")

// routes
router.get('/', handleGetAllUsers);
router.post('/', handleAddAllUsers); 
router.post ('/', handleFileUpload);

module.exports = router;