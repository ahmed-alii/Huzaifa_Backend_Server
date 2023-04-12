const express = require('express');
const {Recipe} = require("../models/Recipe");
const {Ingredients} = require("../models/Ingredients")
const router = express.Router();


// Get all recipes
router.get("/recipes", (req, res, next) => {
    Recipe.find()
        .limit(5)
        .skip(0)
        .then(docs => res.json({success: true, data: docs}))
        .catch(error => res.json({success: false, err: error}));

});


// Search all recipes which has this ingredient
router.get("/searchRecipeByIngredients", (req, res, next) => {

    let q = req.query.q;
    Ingredients.findOne({title: q})
        .exec((err, doc) => {
            if (err) {
                res.json({success: false, err: err})
            } else {
                console.log(doc)
                findRecipesForThisIngredient(doc._id)
            }
        })

    function findRecipesForThisIngredient(ingredientId) {
        Recipe.find({ingredients: {$elemMatch: {ingredient: ingredientId}}})
            // .populate({path: "ingredients.ingredient", model: Ingredients})
            .exec((err, doc) => {
                if (err) {
                    res.json({success: false, err: err})
                } else {
                    res.json({success: true, data: doc})
                }
            })
    }


});

// Search for recipes based on title keyword
router.get("/searchRecipe", (req, res, next) => {
    let q = req.query.q;

    Recipe.aggregate(
        [{
            '$search': {
                'index': 'recipe_txt_search',
                'text': {
                    'query': `{title: ${q}`,
                    'path': {
                        'wildcard': '*'
                    }
                }
            }
        }]
    ).exec((err, doc) => {
        if (err) {
            res.json({success: false, err: err})
        } else {
            res.json({success: true, data: doc})

        }
    })
});

router.get("/recipeById", (req, res, next) => {
    let id = req.query.id;

    Recipe.findOne({_id: id})
        .populate({path: "ingredients.ingredient", model: Ingredients})
        .populate("user", {name: 1})
        .exec((err, doc) => {
            if (err) {
                res.json({success: false, err: err})
            } else {
                res.json({success: true, data: doc})

            }
        })
});


module.exports = router;
