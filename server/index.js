const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');

// Load environment variables from .env if present
dotenv.config();

const app = express();
// Read port and Mongo URI from environment variables with sensible defaults
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/xingliu_demo';

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Ensure uploads directory exists and expose it as static
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Routes registration
app.use('/api/auth', require('./routes/auth'));
// Conditionally mount assets and projects routes if they exist
const assetsRoutePath = path.join(__dirname, 'routes', 'assets.js');
if (fs.existsSync(assetsRoutePath)) {
  try {
    // eslint-disable-next-line global-require
    app.use('/api/assets', require('./routes/assets'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Warning: failed to load assets route:', err.message);
  }
}
const projectsRoutePath = path.join(__dirname, 'routes', 'projects.js');
if (fs.existsSync(projectsRoutePath)) {
  try {
    // eslint-disable-next-line global-require
    app.use('/api/projects', require('./routes/projects'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Warning: failed to load projects route:', err.message);
  }
}
app.use('/api/ai', require('./routes/ai'));

// Swagger/OpenAPI setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AIGC Canvas API',
    version: '1.0.0',
    description: 'API documentation for the infinite canvas application with AI features.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'models', '*.js'),
  ],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root endpoint
app.get('/', (req, res) => {
  res.send('AIGC Canvas API running');
});

// Connect to MongoDB and start server
(async () => {
  try {
    await connectDB(MONGO_URI);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected:', MONGO_URI);
    app.listen(PORT, '0.0.0.0', () => {
      // eslint-disable-next-line no-console
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
})();

// Graceful shutdown on SIGINT (optional)
process.on('SIGINT', async () => {
  try {
    // If using a cached connection in config/db.js this may be unnecessary
    // await mongoose.disconnect();
  } finally {
    process.exit(0);
  }
});