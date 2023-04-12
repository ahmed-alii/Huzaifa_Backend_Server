const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 140
    },
    description: {
        type: String,
        required: true
    },
    prepTime: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true,
        ref: 'Cuisines'
    },
    calories: {
        type: Number,
        maxlength: 5
    },
    servings: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ingredients: [
        {
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Ingredients'
            },
            qty: {
                type: String
            },
            unit: {
                type: String
            }
        }
    ],
    ratings: [
        {
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    totalRatings: {
        type: Number,
        default: 0
    },
    avgRating: {
        type: Number,
        default: 0
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = { Recipe };
