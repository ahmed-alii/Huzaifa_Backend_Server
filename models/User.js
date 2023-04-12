const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const { v4: uuidv4 } = require('uuid');
const {log} = require("debug");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    token: {type: String},
    tokenExp: {type: Number},

    pantry: {
        type: [
            {
                ingredient: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ingredients",
                    required: false,
                    unique: true
                },
                qty: {
                    type: String
                },
                unit: {
                    type: String
                }
            }
        ],
        default: []
    },
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'
        }
    ]
})


userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        console.log('password changed')
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
});


userSchema.methods.comparePassword = function (plainPassword, cb) {
    console.log(plainPassword, this.password)
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function (cb) {
    let user = this;
    let token = jwt.sign(user._id.toHexString(), 'secret')
    user.tokenExp = 720;
    user.token = token;
    user.save(function (err, user) {

        console.log(err, user)

        if (err) return cb(err)
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    jwt.verify(token, 'secret', function (err, decode) {
        user.findOne({"_id": decode, "token": token}, function (err, user) {
            if (err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = {User}