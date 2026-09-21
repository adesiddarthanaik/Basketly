const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
       name: { type: String, required: true },
       price: { type: Number, required: true },
       image: { type: String },
       brand: { type: String, required: true },
       category: { type: String, required: true },
       countInStock: { type: Number, required: true }, 
       description: { type: String },  
    },
    { timestamps: true }
);

// Compound text index for search
productSchema.index(
    {
        name: 'text',
        brand: 'text',
        category: 'text',
        description: 'text',
    },
    {
        weights: {
            name: 10,
            brand: 5,
            category: 3,
            description: 1,
        },
    }
);

module.exports = mongoose.model('Product', productSchema);