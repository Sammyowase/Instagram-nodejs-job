const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// A message must have either a recipient or a group
messageSchema.pre('save', function(next) {
  if (!this.recipient && !this.group) {
    return next(new Error('Message must have either a recipient or a group'));
  }
  if (this.recipient && this.group) {
    return next(new Error('Message cannot have both a recipient and a group'));
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
