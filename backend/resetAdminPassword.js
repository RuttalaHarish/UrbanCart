require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const email = 'admin@urbancart.com';
    const admin = await User.findOne({ email });

    if (!admin) {
      console.log('Admin user not found.');
      console.log('Closing database connection...');
      await mongoose.connection.close();
      console.log('Done.');
      process.exit(0);
    }

    console.log('Admin found');
    console.log('Updating password...');

    admin.password = 'Admin@123';
    await admin.save();

    console.log('Password updated successfully.');
  } catch (error) {
    console.error('An error occurred during password reset:', error.message);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  }
}

resetPassword();
