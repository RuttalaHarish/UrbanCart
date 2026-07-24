require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`UrbanCart Backend Running on Port ${PORT}`);
      console.log("=== Express Router Stack ===");

      if (app._router && app._router.stack) {
        app._router.stack.forEach((layer, index) => {
          console.log(index, {
            name: layer.name,
            path: layer.route ? layer.route.path : undefined,
            regexp: layer.regexp,
          });
        });
      } else {
        console.log("app._router is undefined");
      }
      // DEBUGGING: Print all registered routes to confirm routing table mapping
      const listEndpoints = require('express-list-endpoints');
      console.log('Registered Routes:', listEndpoints(app));
    });
  } catch (error) {
    console.error('Server startup failed.');
    process.exit(1);
  }
};

startServer();