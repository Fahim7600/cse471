const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Notification schema
const notificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Link to the User collection, assuming you're using a User model
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'alert', 'warning'],  // Define the types of notifications (info, alert, warning, etc.)
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,  // Track whether the notification has been read
    },
    createdAt: {
      type: Date,
      default: Date.now,  // Store the time when the notification was created
    },
  },
  { timestamps: true }
);

// Create the Notification model
const Notification = mongoose.model('allNotification', notificationSchema);

module.exports = Notification;
