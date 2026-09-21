const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createOrderPaymentSchema = z.object({
  body: z.object({
    shippingAddress: z.string().min(5, 'Shipping address must be at least 5 characters').optional().or(z.literal('')),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
    razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
    orderId: z.string().regex(objectIdRegex, 'Invalid internal order ID'),
  }),
});

module.exports = {
  createOrderPaymentSchema,
  verifyPaymentSchema,
};
