const express = require('express');

const router = express.Router();

const companiesController = require('../controllers/companies-controller');
const isAuth = require('../middleware/is-Auth');

const bodyParser = require('body-parser').json();

// get users
router.get('/', companiesController.getCompanies);

// add company
router.get('/add-company', isAuth, companiesController.getAddCompany);

router.post('/add-company', bodyParser, companiesController.addCompany);

// edit company
router.post('/edit-company', bodyParser, companiesController.editCompany);

// delete company
router.post('/delete-company', bodyParser, companiesController.deleteCompany);

module.exports = router;