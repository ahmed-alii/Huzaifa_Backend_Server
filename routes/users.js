const express = require('express');
const router = express.Router();
const {User} = require("../models/User");
const {auth} = require("../middleware/auth");
const multer = require("multer");
const crypto = require("crypto");
const {SendResetEmail} = require("../middleware/mailer")
const {Recipe} = require("../models/Recipe");

router.post("/register", (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(200).json({
            success: false,
            message: "Please add your email, name and password."
        });
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    user.save((err, doc) => {
        console.log(doc)
        if (err) return res.json({success: false, err});
        return res.status(200).json({
            success: true,
            message: "User Registered!"
        });
    });
});


/***
 * //Login with email/password.
 * //Use user model's password comparison data.
 * //Then generate token based on the data.
 * //Send this token in cookies.
 *
 */
router.post("/login", (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user)
            return res.json({
                success: false,
                message: "Auth failed, email not found"
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({success: false, message: "Wrong password"});

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.status(200)
                    .json({
                        success: true,
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        token: user.token,
                        authExp: user.tokenExp,
                    });
            });
        });
    });
});


router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user.id}, {token: "", tokenExp: ""}, (err, doc) => {
        if (err) return res.json({success: false, err});
        return res.status(200).send({
            success: true
        });
    });
});

router.get('/token_user', auth, (req, res) => {
    console.log("authenticating user")
    const {_id, name, email} = req.user;
    return res.json({
        success: true,
        user: req.user
    });
});


router.post("/change-password", auth, (req, res) => {

    User.findOne({email: req.user.email}, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "User not found"
            });

        console.log(req.body.password)
        console.log(req.body.newpass)

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({success: true, message: "Wrong password"});

            user.password = req.body.newpass;
            user.save((err, result) => {
                if (err) {
                    console.log(err)
                    return res.json({
                        success: true,
                        message: "Error. Can not update password."
                    });
                }
                return res.json({
                    success: true,
                    message: "Password updated successfully!"
                });
            })
        });
    });

});


router.post("/reset-password", (req, res, next) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user)
            return res.json({
                success: false,
                message: "The provided email is not found."
            });
        else {
            user.token = "snp_" + crypto.randomBytes(20).toString('hex');

            user.save((err, result) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: "We were unable to process your request."
                    });
                }
                req.user = result
                next()
                return res.json({
                    success: true,
                    message: "Please check your email for the password reset link."
                });
            })
        }
    });
}, SendResetEmail);

router.post("/set-password", (req, res, next) => {
    User.findOne({token: req.body.key}, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Unable to change your password. Your link might be expired"
            });
        user.password = req.body.pass;
        user.token = ""

        user.save((err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Error. Can not update password."
                });
            }
            return res.json({
                success: true,
                message: "Password updated successfully!"
            });
        })
    });
});


// FAVTS

router.post('/add-to-favorites', auth, async (req, res) => {
    try {
        const recipeId = req.body.recipeId;

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        const user = await User.findById(req.user._id);

        if (user.favorites.includes(recipeId)) {
            return res.json({success: true, data: 'Recipe already added to favorites'});

        }

        user.favorites.push(recipeId);
        await user.save();


        return res.json({success: true, data: 'Recipe added to favorites successfully'});

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/remove-from-favorites', auth, async (req, res) => {
    try {
        const recipeId = req.body.recipeId;

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        const user = await User.findById(req.user._id);

        if (!user.favorites.includes(recipeId)) {
            return res.status(400).send('Recipe not found in favorites');
        }

        user.favorites = user.favorites.filter((id) => id.toString() !== recipeId.toString());
        await user.save();

        return res.json({success: true, data: 'Recipe removed from favorites successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');

        if (!user) {
            return res.status(404).send('User not found');
        }


        return res.json({success: true, data: user.favorites});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
