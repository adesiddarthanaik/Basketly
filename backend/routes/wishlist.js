const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const validate = require('../middleware/validate');
const { wishlistActionSchema } = require('../validators/wishlist.validator');
const AppError = require('../utils/AppError');

const router = express.Router();

// GET /wishlist - Retrieve user's wishlist with populated products
router.get('/', async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId }).populate('products');

    res.status(200).json({
      success: true,
      data: wishlist || { user: req.userId, products: [] },
    });
  } catch (error) {
    next(error);
  }
});

// POST /wishlist/:productId - Add a product to the user's wishlist
router.post('/:productId', validate(wishlistActionSchema), async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    ).populate('products');

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /wishlist/:productId - Remove a product from the user's wishlist
router.delete('/:productId', validate(wishlistActionSchema), async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate('products');

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist || { user: req.userId, products: [] },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
