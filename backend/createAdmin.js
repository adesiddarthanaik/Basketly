require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function createAdmin() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI environment variable is required.');
    process.exit(1);
  }

  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminSecret123!';

  try {
    await mongoose.connect(mongoUri);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`User ${email} updated to admin role.`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new User({
        username,
        email,
        password: hashedPassword,
        role: 'admin',
      });

      await admin.save();
      console.log(`Admin user ${email} created successfully.`);
    }
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();