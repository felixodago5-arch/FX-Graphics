const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return this.role === 'admin' || this.type === 'registered';
    }
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  type: {
    type: String,
    enum: ['registered', 'guest'],
    default: 'guest'
  },
  profile: {
    name: String,
    company: String,
    avatar: String,
    phone: String,
    preferences: {
      notifications: { type: Boolean, default: true },
      theme: { type: String, default: 'light' }
    }
  },
  lastLogin: Date,
  sessionToken: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
