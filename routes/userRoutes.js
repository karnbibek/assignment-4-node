const express = require('express');

const router = express.Router();

const userController = require('../controllers/userControllers');

router.get('/about-us', userController.aboutus);

// get users
router.get('/get-users', userController.getUsers);

// create new users
const bodyParser = require('body-parser').json();
router.post('/create-user', bodyParser, userController.createUser);

// edit users
router.patch('/edit-user', bodyParser, userController.editUser);

// delete user
router.delete('/delete-user', bodyParser, userController.deleteUser);

module.exports = router;