const User = require('../models/userModel');
const AICreation = require('../models/AICreation');
const path = require("path");
const fs = require('fs').promises; // Use promises for async operations
const mongoose = require("mongoose");



const getAICreationById = async (req, res) => {
    const { videoId } = req.body;
    try {
        const aiCreation = await AICreation.findById(videoId);
        if (!aiCreation) {
            return res.status(404).json({ message: 'AICreation not found' });
        }
        res.status(200).json(aiCreation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



const exportVideo = async (req, res) => {

};



const fetchRecentProject = async (req, res) => {
    const { videoId } = req.params;
    
    try {
        const aiCreation = await AICreation.findById(videoId);
        if (!aiCreation) {
            return res.status(404).json({ message: 'AICreation not found' });
        }

        // If rating is NOT null, do not send the response
        if (aiCreation.rating !== null) {
            return res.status(403).json({ message: 'Access denied. Rating already exists.' });
        }

        res.status(200).json(aiCreation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const pushResentVideoFeedback = async (req, res) => {
    const { videoId, rating } = req.body;
    console.log(req.body);  

    try {
        const aiCreation = await AICreation.findById(videoId);
        if (!aiCreation) {
            return res.status(404).json({ message: 'AICreation not found' });
        }

        aiCreation.rating = rating;
        await aiCreation.save();

        res.status(200).json({ message: 'Rating updated successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


const getCredit = async (req, res) => {
    try {
        // Extract user ID from the request object
        const userId = req.user._id;


        // Fetch user data from the database
        const foundUser = await User.findById(userId);
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the credit data
        res.status(200).json({ credit: foundUser.tokens });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getSavedProjects = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log("User ID:", userId);

    const userProjects = await AICreation.find({ user: userId });

    if (!userProjects.length) {
      return res.status(404).json({ 
        message: "No saved projects found",
        action: "create" 
      });
    }

    res.status(200).json(userProjects);
  } catch (error) {
    console.error("Error fetching saved projects:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const userDetails = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const savePayment = async (req, res) => {
  try {
    const userId = req.user;
    const { paymentId, amount, plan, tokens } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = plan;
    user.tokens += tokens;
    user.purchaseHistory.push({
      date: new Date(),
      plan,
      amount,
      tokens,
    });

    await user.save();
    res.status(200).json({ message: "Payment saved successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAICreationById, exportVideo ,fetchRecentProject , pushResentVideoFeedback ,getCredit , getSavedProjects , userDetails , savePayment };
