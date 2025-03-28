const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const AICreation = require('../models/AICreation');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// User Controller methods
const userController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check if user already exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = await User.create({
                name,
                email,
                password: hashedPassword
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Check for user email
            const user = await User.findOne({ email });
            
            if (user && (await bcrypt.compare(password, user.password))) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Get user profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update basic info
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.language = req.body.language || user.language;
            user.voicePreference = req.body.voicePreference || user.voicePreference;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                language: updatedUser.language,
                voicePreference: updatedUser.voicePreference,
                tokens: updatedUser.tokens,
                plan: updatedUser.plan,
                renewalDate: updatedUser.renewalDate,
                purchaseHistory: updatedUser.purchaseHistory,
                aiCreations: updatedUser.aiCreations
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    // Google OAuth authentication
    googleAuth: async (req, res) => {
        try {
            const { tokenId } = req.body;
            const ticket = await client.verifyIdToken({
                idToken: tokenId,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const { email, name, picture, sub: googleId } = ticket.getPayload();

            let user = await User.findOne({ email });
            
            if (!user) {
                // Create new user if doesn't exist
                user = await User.create({
                    name,
                    email,
                    googleId,
                    profileImage: picture
                });
            } else if (!user.googleId) {
                // Link Google account to existing email account
                user.googleId = googleId;
                user.profileImage = picture;
                await user.save();
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            });
        } catch (error) {
            res.status(401).json({ message: 'Invalid Google token' });
        }
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};












module.exports = userController;