const User = require('../models/user');

exports.aboutus = (req, res, next) => {
    res.render('about-us', { 
        pageTitle: 'About US',
        path: '/about-us'
     });
};

exports.getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        return res.status(500).json({
            message: "Fetching Users failed!!, Please try again."
        });
    }
    res.status(200).json({ users });
};

exports.createUser = async (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;

    const createdUser = new User({
        firstName,
        lastName,
        email,
        phone
    });

    try {
        await createdUser.save();
    } catch (err) {
        return res.status(500).json({
            message: "Adding User failed!!, Please try again."
        });
    }

    res.status(200).json({ user: createdUser });
}

exports.editUser = async (req, res, next) => {
    const id = req.body.id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;

    const editMode = req.query.editMode;

    if (!id) {
        return res.status(422).json({ message: "Please select a user to see the details!!" })
    }

    if (!editMode) {
        return res.status(422).json({ message: "Edit mode must be true to update the details." });
    }

    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        return res.status(422).json({ message: "Could not find user for the provided id!!" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;

    try {
        await user.save();
    } catch (err) {
        res.status(422).json({ message: "Some unknown error occurred!! Could not update user!" })
    }

    res.status(200).json({ user });
}

exports.deleteUser = async (req, res, next) => {
    // console.log(req.body);
    const id = req.body.id;

    if (!id) {
        return res.status(422).json({ message: "Please select a user to delete!!" });
    }

    let user;
    await User.findByIdAndDelete(id, (err, user) => {
        if (err) {
            return res.status(422).json({ message: "Some unknown error occurred while deleting user!" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    })

}
