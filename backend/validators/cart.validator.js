const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const cartItemActionSchema = z.object({
  body: z.object({
    productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  }),
});

module.exports = {
  cartItemActionSchema,
};
