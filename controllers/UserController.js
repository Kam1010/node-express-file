// controllers/UserController.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const middleware = require('../middlewares/middlewares');
const jwt = require('jsonwebtoken');

// Get All Users

router.get('/', async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).json({data:users, message: "Users Fetched Successfully!"})
    }
    catch(err){
        res.status(500).json({message: "Server Error"})
    }
})

// Register a new user
router.post('/register', middleware, async (req, res) => {
    try {
        const data = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }

        // Create a new user
        const newUser = new User(data);
        await newUser.save();

        res.status(201).json({data:newUser,  message: 'User registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the password is correct
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, `${process.env.SECRET}`, { expiresIn: '1h' });

        res.status(200).json({data:{user, token}, message: 'Login successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, `${process.env.SECRET}`);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

router.post('/logout', verifyToken, (req, res) => {
    res.json({ message: 'Logout successful.' });
});

module.exports = router;
