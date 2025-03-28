const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.googleId; }},
    googleId: { type: String, unique: true, sparse: true },
    profileImage: { type: String },
    language: { type: String, default: 'English' },
    voicePreference: { type: String, default: 'Male' },
    tokens: { 
        type: Number, 
        default: function() {
            return this.plan === 'Free' ? 10 : 999;
        }
    },
    plan: { type: String, default: 'Free' },
    renewalDate: { type: Date },
    lastTokenReset: { type: Date, default: Date.now },
    purchaseHistory: [{
        date: Date,
        plan: String,
        amount: Number,
        tokens: Number
    }],
    aiCreations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AICreation' }]
}, { timestamps: true });

// Middleware to reset tokens daily
userSchema.pre('save', function(next) {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

    // Check if it's a new day since last reset
    if (!this.lastTokenReset || (now - this.lastTokenReset) >= oneDay) {
        this.tokens = this.plan === 'Free' ? 100 : 999;
        this.lastTokenReset = now;
    }
    
    next();
});

// Optional: Method to manually reset tokens
userSchema.methods.resetTokens = function() {
    this.tokens = this.plan === 'Free' ? 100 : 999;
    this.lastTokenReset = new Date();
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
