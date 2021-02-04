const express = require('express');
const jwt = require('jwt-simple');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const _ =require('lodash');
const Models = require('../models');
const systemConfig = require('../configs/globalConfig');


const router = express.Router();

router.post('/signup', [
  check('email', 'Your email is not valid').isEmail(),
  check('name').isLength({ min: 3 }).withMessage('minlength is 3 charachters'),
  check('password').matches(/(?=.*?[#?!@$%^&*-])(?=.*[A-Z]).{12,}/, "i").withMessage("Password must contain at least 12 Charachters, at least one Uppercase, at least one non-alphanumeric"),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    req.body.email.toLowerCase();
    return bcrypt.genSalt(10, (error, salt) => {
      if (error) return res.status(500).json({ msg: 'an error in password' });
      return bcrypt.hash(req.body.password, salt, (hashError, hash) => {
        if (hashError) return res.status(500).json({ msg: 'an error in password' });
        req.body.password = hash;
        const row = new Models.User(req.body);
        row.save((err) => {
          if (err) {
            if (_.get(err, 'name') === 'ValidationError') {
              return res.status(500).json({
                msg: _.get(err, 'message'),
              });
            }
            return res.status(500).json(err);
          }
          return res.status(201).json({ msg: 'A new user has been created successfully' });
        });
      });
    });
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

router.post('/login', [
  check('email', 'Your email is not valid').isEmail(),
  check('password').matches(/(?=.*?[#?!@$%^&*-])(?=.*[A-Z]).{12,}/, "i").withMessage("Password must contain at least 12 Charachters, at least one Uppercase, at least one non-alphanumeric"),

], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return Models.User.findOne({email:req.body.email}, (err, user) => {
      if (err) return res.status(500).json(err);
      if (!user) {
        return res.status(403).json({
          msg: 'User not found',
        });
      }
     
      if (_.has(user, 'setPasswordDate')) {
        if (helper.daysNumber(user.setPasswordDate) < systemConfig.daysPasswordValidity) {
          return res.status(403).json({
            msg: 'The password is expired',
          });
        }
      }

      if (_.has(user, 'passwordAttempt')) {
        if (user.passwordAttempt < systemConfig.maxPasswordAttempt) {
          return res.status(403).json({
            msg: 'You have reached maximum attempt',
          });
        }
      }
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        if (!user.passwordAttempt) {
          user.passwordAttempt = 1;
        } else {
          user.passwordAttempt += 1;
        }

        user.save((error) => {
          if (error) return res.json(err);
          if (user.passwordAttempt > systemConfig.maxPasswordAttempt) {
            return res.status(403).json({
              msg: 'You have reached maximum attempt',
            });
          }

          return res.status(403).json({
            msg: 'Wrong password',
          });
        });
      } else {
        const milliseconds = new Date().getTime() + (systemConfig.jwtExpiredDateMinutes * 60 * 1000);
        const token = jwt.encode({
          _id: _.get(user, '_id'),
          name: user.name,
          roles: user.roles,
          expiredDate: milliseconds,
        }, process.env.SECRET_JWT);
        const tokenString = `${token}`;
        user.last_login = new Date();
        res.set('Authorization', tokenString);
        user.markModified('logins');
        user.passwordAttempt = 0;

        user.save((error) => {
          if (error) return res.json(error);
          const returnData = {
            msg: 'Login successfully',
            token: tokenString,
            name: user.name,
            last_login: user.last_login,
          };
          return res.status(200).json(returnData);
        });
      }
    });
  } catch (e) {
    return res.status(500).json(e.message);
  }
});


module.exports = router;
