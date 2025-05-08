const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerAdminSpec = require('./swaggerAdmin');

// Admin API documentation
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerAdminSpec, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
  }
}));

module.exports = router;
