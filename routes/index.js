const express = require('express');
const router = express.Router();
const cors = require('cors')
const config = require('../configs/config');
const whitelist = config.corsWhitelist.split(',');

const corsOptions = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      // !origin // allow requests with no origin (like mobile apps or curl requests)
      callback(null, true);
    } else {
      console.log(`Not allowed by CORS, Origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  exposedHeaders: 'Authorization',
};

router.use(cors(corsOptions));

router.use('/api/user', require('./user'));
router.use('/api/auth', require('./auth'));


module.exports = router;
