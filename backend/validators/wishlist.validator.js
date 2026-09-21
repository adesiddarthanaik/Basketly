const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const wishlistActionSchema = z.object({
  params: z.object({
    productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  }),
});

module.exports = {
  wishlistActionSchema,
};
