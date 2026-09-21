const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ordersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    orderItems: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order must have at least one product']
    },

    shippingAddress: { type:String},

    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['placed', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'placed'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', ordersSchema);