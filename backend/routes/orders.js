const express = require('express');
const Order = require('../models/Orders');
const requireAdmin = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const {
  updateOrderStatusSchema,
  adminOrdersQuerySchema,
} = require('../validators/order.validator');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('orderItems.product')
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/delivered', async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.userId,
      status: 'delivered',
    })
      .populate('orderItems.product')
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/cancelled', async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.userId,
      status: 'cancelled',
    })
      .populate('orderItems.product')
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/admin', requireAdmin, validate(adminOrdersQuerySchema), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [allOrders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate('orderItems.product')
        .populate('user', 'username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalOrders / limit));

    res.json({
      success: true,
      data: allOrders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/summary', requireAdmin, async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: {
            $sum: {
              $cond: [
                { $in: ['$status', ['paid', 'delivered']] },
                { $ifNull: ['$totalAmount', 0] },
                0,
              ],
            },
          },
          placed: { $sum: { $cond: [{ $eq: ['$status', 'placed'] }, 1, 0] } },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          shipped: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
    ]);

    const row = result[0] || {
      totalOrders: 0,
      totalSales: 0,
      placed: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    const summary = {
      totalOrders: row.totalOrders,
      totalSales: row.totalSales,
      countsByStatus: {
        placed: row.placed,
        paid: row.paid,
        shipped: row.shipped,
        delivered: row.delivered,
        cancelled: row.cancelled,
      },
      activeOrders: row.placed + row.paid + row.shipped,
      completedOrders: row.delivered,
      inTransit: row.shipped,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      ...(req.userRole === 'admin' ? {} : { user: req.userId }),
    })
      .populate('orderItems.product')
      .populate('user', 'username email')
      .lean();

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requireAdmin, validate(updateOrderStatusSchema), async (req, res, next) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return next(new AppError('Order not found', 404));
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;