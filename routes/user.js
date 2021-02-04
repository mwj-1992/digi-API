const express = require('express');
const { validationResult, query, check } = require('express-validator');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const Models = require('../models');

const router = express.Router();
/**
 * Retrieve all users
 */
router.get(
  '/',
  [
    query('name').isString().optional(),
    query('email').isString().optional(),
    query('created_date').isString().optional(),
    query('order_by').isString().optional(),
    query('limit').isNumeric().optional(),
    query('offset').isNumeric().optional(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const skip = req.query.offset || 0;
    const orderBy = req.query.order_by || '-create.at';
    const limit = parseInt(req.query.limit, 10) || process.env.QUERY_LIMIT;
    const search = {};
    if (_.get(req.query, 'created_date')) search.create.at = _.get(req.query, 'created_date');
    if (_.get(req.query, 'name')) {
      search.name ={ $regex: _.get(req.query, 'name'), $options: '-i' } ;
    }
    if (_.get(req.query, 'email')) search.email = { $regex: _.get(req.query, 'email'), $options: '-i' };
    const queryStatement = Models.User.find(search, { password: 0 })
      .sort(orderBy)
      .skip(skip * limit)
      .limit(parseInt(limit, 10))
    return queryStatement.exec((err, data) => {
      if (err) {
        return res.json({
          msg: 'Something went wrong',
          error: err,
        });
      }
      return Models.User.count(search, (_err, count) => res.json({
        msg: 'Retrieve all users',
        data,
        count,
      }));
    });
  },
);


module.exports = router;
