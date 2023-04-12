const express = require('express');
const {User} = require("../models/User");
const router = express.Router();

router.get("/set-new-password", (req, res, next) => {
    let {key} = req.query;

    res.render('reset-password', {key: key});
});

router.post("/set", (req, res, next) => {
    User.findOne({token: req.body.key}, (err, user) => {
        if (!user)
            return res.render("result", {
                success: false,
                message: "Unable to change your password. Your link might be expired"
            });
        user.password = req.body.pass;
        user.token = ""

        user.save((err, result) => {
            if (err) {
                return res.render("result", {
                    success: false,
                    message: err.message
                });
            }
            return res.render("result", {
                success: true,
                message: "Password updated successfully!"
            });
        })
    });
});


module.exports = router;
