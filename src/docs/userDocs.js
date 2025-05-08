const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerUserSpec = require('./swaggerUser');

// User API documentation
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerUserSpec, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
  }
}));

module.exports = router;
