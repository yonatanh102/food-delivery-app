const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const authController = require('../controllers/auth');

const verifyToken = require('../middleware/auth');

// public routes
router.post('/', usersController.createUser);
router.post('/login', authController.login);

// private routes
router.get('/', verifyToken, usersController.getUsers);
router.get('/:id', verifyToken, usersController.getUserById);
router.put('/:id', verifyToken, usersController.updateUser);
router.delete('/:id', verifyToken, usersController.deleteUser);

module.exports = router;