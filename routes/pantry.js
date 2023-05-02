const express = require('express');
const {Recipe} = require("../models/Recipe");
const {Ingredients} = require("../models/Ingredients");
const {User} = require("../models/User");
const router = express.Router();

router.post("/add", (req, res, next) => {
    let i = new Ingredients({title: req.body.title.toLowerCase()})
    i.save((err, doc) => {
        if (err) {
            if (err.code === 11000) { //if key already present
                console.log("already present")
                Ingredients.findOne(err.keyValue).exec((err, doc) => {
                    if (err) {
                        console.log("error finding the recipe")
                    } else {
                        addInPantry(doc._id)
                    }
                })
            } else {
                res.json({success: false, err: err})
            }
        } else {
            addInPantry(doc._id)
        }
    })

    function addInPantry(docID) {
        let ingredientObject = {
            _id: docID,
            qty: req.body.qty,
            unit: req.body.unit
        };

        User.findOneAndUpdate({_id: req.user._id}, {'$addToSet': {pantry: ingredientObject}}, {upsert: true, new: true})
            .exec((err, doc) => {
                if (err) {
                    res.json({success: false, err: err})
                } else {
                    res.json({success: true, data: "New Item Added In Pantry"})
                }
            })
    }


});


// /get pantry
router.get('/', (req, res, next) => {
    User.findOne({_id: req.user._id})
        .populate({
            path: 'pantry._id',
            select: 'title',
            model: 'Ingredients'
        })
        .select('pantry')
        .exec((err, user) => {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true, data: user.pantry});
            }
        });
});


//remove from pantry
router.get("/delete", (req, res, next) => {
    let delID = req.query.id;
    console.log(delID)

    User.findOneAndUpdate({_id: req.user._id},
        {"$pull": {pantry: {_id: delID}}},
        // {pantry: []},
        {
            new: true
        })
        .exec((err, doc) => {
            if (err) {
                res.json({success: false, err: err})
            } else {
                res.json({success: true, data: doc})
            }
        })
});

router.post('/i-made-this', async (req, res) => {
    try {
        const recipeId = req.body.recipeId;
        const recipe = await Recipe.findById(recipeId).populate('ingredients.ingredient');

        if (!recipe) {
            return res.json({success: false, err: 'Recipe not found'});
        }

        let data = 'Ingredients deducted from pantry successfully'
        const user = await User.findById(req.user._id);
        recipe.ingredients.forEach((ingredient) => {
            const pantryItemIndex = user.pantry.findIndex(
                (item) => item._id.toString() === ingredient.ingredient._id.toString()
            );
            if (pantryItemIndex !== -1 && !isNaN(ingredient.qty)) {

                user.pantry[pantryItemIndex].qty -= ingredient.qty;
                user.pantry[pantryItemIndex].qty = Math.max(0, user.pantry[pantryItemIndex].qty); // Make sure the quantity doesn't go negative
            } else {
                data = "Items not found in your pantry."
            }
        });

        await user.save();
        return res.json({success: true, data: data});
    } catch (err) {
        console.error(err);
        // return res.json({ success: false, err: 'Server Error' });
    }
});


module.exports = router;


