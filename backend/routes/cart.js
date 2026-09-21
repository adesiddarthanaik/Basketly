const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const validate = require('../middleware/validate');
const { cartItemActionSchema } = require('../validators/cart.validator');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('cartItems.product');
    res.json({
      success: true,
      data: cart || { user: req.userId, cartItems: [] },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/add', validate(cartItemActionSchema), async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    let cart = await Cart.findOne({ user: req.userId });

    const existingItem = cart?.cartItems.find(
      (item) => item.product.toString() === productId
    );

    const totalRequested = (existingItem?.quantity || 0) + quantity;
    if (product.countInStock < totalRequested) {
      return next(
        new AppError(
          `Cannot add item: Only ${product.countInStock} units in stock (${existingItem?.quantity || 0} already in your cart)`,
          400
        )
      );
    }

    if (!cart) {
      cart = await Cart.create({
        user: req.userId,
        cartItems: [{ product: productId, quantity }],
      });
    } else {
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.cartItems.push({ product: productId, quantity });
      }
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('cartItems.product');
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/remove', validate(cartItemActionSchema), async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return next(new AppError('Product not found in cart', 404));
    }

    if (existingItem.quantity > quantity) {
      existingItem.quantity -= quantity;
      await cart.save();
    } else {
      cart.cartItems = cart.cartItems.filter(
        (item) => item.product.toString() !== productId
      );

      if (cart.cartItems.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
        return res.status(200).json({
          success: true,
          message: 'Cart is now empty',
          data: { user: req.userId, cartItems: [] },
        });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('cartItems.product');
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;