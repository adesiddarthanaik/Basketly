const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/middleauth');
const requireAdmin = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updateRoleSchema } = require('../validators/auth.validator');
const AppError = require('../utils/AppError');

const router = express.Router();

router.post('/signUp', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User with this email already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid credentials', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 400));
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.SUPER_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.userRole,
    },
  });
});

router.patch('/users/:userId/role', authMiddleware, requireAdmin, validate(updateRoleSchema), async (req, res, next) => {
  try {
    const { role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, runValidators: true }
    ).select('_id username email role');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      message: 'User role updated',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;