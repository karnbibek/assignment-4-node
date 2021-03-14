const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Companies = Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
});

module.exports = mongoose.model('Companies', Companies);