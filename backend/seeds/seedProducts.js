/*
 * UrbanCart — Professional Database Product Seeder
 * Populates MongoDB with exactly 300 realistic test products across 10 categories.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const sampleProducts = require('./sampleProducts');

const seedProducts = async () => {
  try {
    console.log('----------------------------------------------------');
    console.log('🚀 Starting UrbanCart Product Database Seeder...');
    console.log('----------------------------------------------------');

    // 1. Connect to MongoDB database
    await connectDB();

    // 2. Find Admin or User to set as createdBy
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      console.warn('⚠️ WARNING: No existing User or Admin found in database.');
      console.warn('⚠️ Please register an admin user first or seed users.');
      console.warn('⚠️ Creating a placeholder ObjectId for product createdBy field...');
    }

    const createdByUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
    if (adminUser) {
      console.log(`👤 Associated createdBy with User: ${adminUser.email} (${adminUser._id})`);
    }

    // 3. Clear existing products (Idempotent execution)
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing products from database.`);

    // 4. Attach createdBy to all 300 sample products
    const productsToInsert = sampleProducts.map((prod) => ({
      ...prod,
      createdBy: createdByUserId,
    }));

    // 5. Insert all 300 products into MongoDB
    const insertedProducts = await Product.insertMany(productsToInsert);

    // 6. Generate Category Breakdown Summary
    const categoryCounts = insertedProducts.reduce((acc, prod) => {
      acc[prod.category] = (acc[prod.category] || 0) + 1;
      return acc;
    }, {});

    console.log('----------------------------------------------------');
    console.log('📊 Category Breakdown:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   • ${cat.padEnd(16)}: ${count} products`);
    });

    console.log('----------------------------------------------------');
    console.log(`✅ SUCCESS: Inserted ${insertedProducts.length} products into MongoDB!`);
    console.log('----------------------------------------------------');

    // 7. Close Database Connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING ERROR:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

seedProducts();
