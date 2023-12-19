const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique:true
  },
  password: {
    type: String,
    required: true,
  },
  confirm_password: {
    type: String,
    required: true,
  },
  DOB:{
    type: String
  }
  // Add other fields as needed
});

// Middleware to check if password and confirm_password match
userSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
      if (this.password !== this.confirm_password) {
        return next(new Error("Passwords don't match."));
      }
    }
    next();
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
