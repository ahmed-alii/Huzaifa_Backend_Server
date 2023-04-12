let nodemailer = require('nodemailer');
let smtpTransport = require('nodemailer-smtp-transport');
let handlebars = require('handlebars');
let fs = require('fs');
let config = require("../config/key")

let mailConfig = {
    host: "premium89.web-hosting.com",
    secure: true,
    port: "465",
    auth: {
        user: "no-reply@uptrend.agency",
        pass: "zKrY0&nags7h"
    }
}

let readHTMLFile = function (path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            callback(err);
            throw err;
        } else {
            callback(null, html);
        }
    });
};

smtpTransport = nodemailer.createTransport(smtpTransport({
    host: mailConfig.host,
    secure: mailConfig.secure,
    port: mailConfig.port,
    auth: {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.pass
    }
}));


const SendResetEmail = (req, res, next) => {
    let link = config.hostname+"authentication/set-new-password?key="+req.user.token;

    readHTMLFile(__dirname + '/emails/resetPassword.html', function (err, html) {
        let template = handlebars.compile(html);
        let replacements = {
            link: link
        };


        let htmlToSend = template(replacements);
        let mailOptions = {
            from: 'no-reply@uptrend.agency',
            to: req.user.email,
            subject: 'Password Reset',
            html: htmlToSend
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            }
        })
    });
}

module.exports = {SendResetEmail}
