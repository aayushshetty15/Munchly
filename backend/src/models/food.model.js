const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    cuisine: {
      type: String,
      default: 'Chef Special',
    },
    foodPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'foodpartner',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const foodModel = mongoose.model('food', foodSchema);

module.exports = foodModel;