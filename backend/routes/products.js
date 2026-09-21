const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/middleauth');
const requireAdmin = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
} = require('../validators/product.validator');
const AppError = require('../utils/AppError');

const router = express.Router();

// Helper to escape special regex characters (prevents ReDoS attacks)
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /products with full multi-field search, filter, sort, and pagination
router.get('/', validate(listProductsQuerySchema), async (req, res, next) => {
  try {
    const { search, category, brand, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 50 } = req.query;

    const query = {};

    // Multi-field search across title, brand, category, and description
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { brand: { $regex: sanitized, $options: 'i' } },
        { category: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (category && category.trim()) {
      query.category = category.trim();
    }

    if (brand && brand.trim()) {
      query.brand = brand.trim();
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (inStock === 'true' || inStock === true) {
      query.countInStock = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    else if (sortBy === 'price_desc') sortOption = { price: -1 };
    else if (sortBy === 'name_asc') sortOption = { name: 1 };
    else if (sortBy === 'newest') sortOption = { createdAt: -1 };

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (parsedPage - 1) * parsedLimit;

    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(parsedLimit).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / parsedLimit),
        currentPage: parsedPage,
        pageSize: parsedLimit,
      },
      searchMeta: {
        query: search?.trim() || null,
        matchesCount: totalProducts,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const sanitized = escapeRegex(name.trim());

    const products = await Product.find({
      name: { $regex: `^${sanitized}$`, $options: 'i' },
    }).lean();

    if (!products.length) {
      return next(new AppError('No products found matching that name', 404));
    }

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validate(getProductByIdSchema), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/addProduct', authMiddleware, requireAdmin, validate(createProductSchema), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, requireAdmin, validate(updateProductSchema), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, requireAdmin, validate(getProductByIdSchema), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;