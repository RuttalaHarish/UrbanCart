require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`UrbanCart Backend Running on Port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed.');
    process.exit(1);
  }
};

startServer();