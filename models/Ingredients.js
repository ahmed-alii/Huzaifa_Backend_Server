const mongoose = require('mongoose');

const ingredientschema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 140,
        unique: true,
    },
})
const Ingredients = mongoose.model('Ingredients', ingredientschema);
module.exports = {Ingredients}