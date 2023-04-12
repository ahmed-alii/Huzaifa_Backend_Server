const express = require('express');
const {Recipe} = require("../models/Recipe");
const {Ingredients} = require("../models/Ingredients");
const router = express.Router();

router.post("/new-recipe", (req, res) => {

    function parseIngredientToAddInRecipe(docID, ing) {
        return {
            ingredient: docID,
            qty: ing.qty,
            unit: ing.unit
        }
    }

    let title = req.body.title;
    let prepTime = req.body.prepTime;
    let instructions = req.body.description;
    let servings = req.body.servings;
    let calories = req.body.calories;
    let cuisine = req.body.cuisine.length > 0 ? req.body.cuisine : "-"
    let ings = []

    let promiseArray = [];

    req.body.ingredients.forEach(async ing => {
        console.log("adding ingredient to database")

        promiseArray.push(new Promise(async (resolve) => {

            let i = new Ingredients({title: ing.title})
            await i.save((err, doc) => {
                if (err) {
                    if (err.code === 11000) { //if key already present
                        Ingredients.findOne(err.keyValue).exec((err, doc) => {
                            if (err) {
                                console.log("error finding the recipe")
                            } else {
                                console.log(doc._id)
                                ings.push(parseIngredientToAddInRecipe(doc._id, ing))
                                resolve(doc._id);
                            }
                        })
                    }
                } else {
                    ings.push(parseIngredientToAddInRecipe(doc._id, ing))
                    resolve(doc._id);

                }
            })


        }));


    })


    Promise.all(promiseArray).then((results) => {
        console.log(results)

        let recipe = new Recipe({
            title: title,
            description: instructions,
            prepTime: prepTime,
            cuisine: cuisine,
            calories: calories,
            servings: servings,
            user: req.user._id,
            ingredients: ings
        })

        recipe.save((err, doc) => {
            if (err) {
                res.json({success: false, err: err})
            } else {
                res.json({success: true, data: doc})
            }
        })
    });

});

router.post('/add-recipe-rating', async (req, res) => {

    try {
        const { recipeId, rating, comment } = req.body;

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        recipe.ratings.push({ rating, comment });
        recipe.totalRatings += 1;
        recipe.avgRating =
            (recipe.avgRating * (recipe.totalRatings - 1) + rating) / recipe.totalRatings;
        await recipe.save();

        return res.json({ success: true, data: 'Rating added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




module.exports = router;

