const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    default: 'book'
  },
  color: {
    type: String,
    default: '#4a6fa5'
  },
  materialsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

// Update material count middleware
subjectSchema.pre('save', async function(next) {
  if (this.isModified('code')) {
    // Update all materials with this subject code
    const Material = require('./Material');
    const count = await Material.countDocuments({ subject: this.code, isActive: true });
    this.materialsCount = count;
  }
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;