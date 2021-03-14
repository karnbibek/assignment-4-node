const Company = require('../models/companies');

exports.getCompanies = async (req, res, next) => {
    let companies;
    try {
        companies = await Company.find();
    } catch (err) {
        return res.status(500).json({
            message: "Fetching Companies failed!!, Please try again."
        });
    }
    // res.status(200).json({ companies: companies });
    res.render('admin/companies', {
        companies,
        pageTitle: 'Companies',
        path: '/'
    });
};

exports.getAddCompany = (req, res, next) => {
    res.render('admin/add-company', {
        pageTitle: 'Add company',
        path: '/add-company',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.addCompany = async (req, res, next) => {
    const { name, url, location, description } = req.body;

    if (!name || !url || !location) {
        return res.status(422).json({ message: "Please enter all the fields correctly!!" });
    }

    const createdCompany = new Company({
        name,
        url,
        location,
        description
    });

    try {
        await createdCompany.save();
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

    res.redirect('/');
}

exports.editCompany = async (req, res, next) => {
    const { id, name, url, location, description } = req.body;
    const editMode = req.query.editMode;

    if (!id) {
        return res.status(422).json({ message: "Please select a company to update the details" });
    }

    if (!editMode) {
        return res.status(422).json({ message: "Edit mode must be true to update the details." });
    }

    let company;
    try {
        company = await Company.findById(id);
    } catch (err) {
        return res.status(422).json({ message: "Could not find company for the provided id!!" });
    }

    if (!name || !url || !location) {
        return res.status(422).json({ message: "Could not find company for the provided id!!" });
    }

    company.name = name;
    company.url = url;
    company.location = location;
    company.description = description;

    try {
        await company.save();
    } catch (err) {
        res.status(422).json({ message: "Some unknown error occurred!! Could not update company!" })
    }

    res.status(200).json({ company: company });
};

exports.deleteCompany = async (req, res, next) => {
    const { id } = req.body;

    if (!id) {
        res.status(422).json({ message: "Please select a company to delete it." })
    }

    let company;
    await Company.findByIdAndDelete(id, (err, company) => {
        if (err) {
            return res.status(422).json({ message: "Some unknown error occurred while deleting company!" });
        }
        res.status(200).json({ message: "Company deleted successfully" });
    })
}
