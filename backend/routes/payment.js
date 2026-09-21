const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const Order = require('../models/Orders');
const Product = require('../models/Product');
const validate = require('../middleware/validate');
const {
  createOrderPaymentSchema,
  verifyPaymentSchema,
} = require('../validators/payment.validator');
const AppError = require('../utils/AppError');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.TEST_KEY || 'rzp_test_placeholder',
  key_secret: process.env.TEST_SECRET || 'rzp_secret_placeholder',
});

router.post('/create-order', validate(createOrderPaymentSchema), async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.userId }).populate('cartItems.product');

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    // Verify stock for all items before proceeding
    for (const item of cart.cartItems) {
      if (!item.product) {
        return next(new AppError('One of the products in your cart is no longer available', 400));
      }
      if (item.product.countInStock < item.quantity) {
        return next(
          new AppError(
            `Insufficient stock for "${item.product.name}". Only ${item.product.countInStock} available.`,
            400
          )
        );
      }
    }

    const orderItems = cart.cartItems.map((item) => {
      const price = Number(item.product?.price ?? 0);
      const quantity = Number(item.quantity || 0);

      return {
        product: item.product._id,
        quantity,
        priceAtPurchase: price,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.priceAtPurchase * item.quantity;
    }, 0);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `order_rcpt_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.userId,
      orderItems,
      shippingAddress: shippingAddress || '',
      totalAmount,
      status: 'placed',
      paymentStatus: 'pending',
    });

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      razorpayOrder,
      orderId: order._id,
      amount: totalAmount,
      keyId: process.env.TEST_KEY,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.TEST_SECRET || 'rzp_secret_placeholder')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError('Invalid payment signature', 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Deduct stock for each purchased item
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity },
      });
    }

    order.paymentStatus = 'paid';
    order.status = 'paid';
    await order.save();

    // Clear the user's cart
    await Cart.findOneAndUpdate({ user: req.userId }, { cartItems: [] });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { orderId: order._id, status: order.status },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;