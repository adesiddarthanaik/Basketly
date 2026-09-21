const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const listProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().max(100, 'Search term too long').optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    inStock: z.enum(['true', 'false', '']).optional().or(z.boolean().optional()),
    sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', '']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
    brand: z.string().min(1, 'Brand is required'),
    category: z.string().min(1, 'Category is required'),
    countInStock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
    description: z.string().optional().default(''),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.coerce.number().positive().optional(),
    image: z.string().url().optional().or(z.literal('')),
    brand: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    countInStock: z.coerce.number().int().nonnegative().optional(),
    description: z.string().optional(),
  }),
});

const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid product ID'),
  }),
});

module.exports = {
  listProductsQuerySchema,
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
};
