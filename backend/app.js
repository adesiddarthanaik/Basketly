const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const http = require('http');
const server = http.createServer(app);
const authMiddleware = require('./middleware/middleauth');
app.use(express.json());
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
}));
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('MongoDB connected');
    })
    .catch((error)=>{
        console.error('MongoDB error: ',error);
    });


const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

app.use('/auth', require('./routes/auth'));

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted", userId: req.userId });
});
app.use('/products', require('./routes/products'));
app.use('/orders', authMiddleware, require('./routes/orders'));
app.use('/cart', authMiddleware, require('./routes/cart'));
app.use('/payment', authMiddleware, require('./routes/payment'));
app.use('/wishlist', authMiddleware, require('./routes/wishlist'));

// Catch-all 404 handler
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handler
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

