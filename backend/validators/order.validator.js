const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const allowedStatuses = ['placed', 'paid', 'shipped', 'delivered', 'cancelled'];

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(allowedStatuses, {
      errorMap: () => ({ message: `Status must be one of: ${allowedStatuses.join(', ')}` }),
    }),
  }),
});

const adminOrdersQuerySchema = z.object({
  query: z.object({
    status: z.enum(allowedStatuses).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

module.exports = {
  updateOrderStatusSchema,
  adminOrdersQuerySchema,
};
