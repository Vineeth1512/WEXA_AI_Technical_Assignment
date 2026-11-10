const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'User must belong to an organization'],
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required']
    }
  },
  {
    timestamps: true
  }
);

// Method to verify candidate password against stored bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Security: Automatically exclude password_hash when serializing user document to JSON
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password_hash;
  return userObj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

