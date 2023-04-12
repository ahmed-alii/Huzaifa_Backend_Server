const {User} = require('../models/User');

let auth = (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")){
        token = token.substring(7, token.length);
    }

    User.findByToken(token, (err, user) => {

        if (err) throw err;
        if (!user)
            return res.json({
                isAuth: false,
                error: true,
                success: false
            });
        req.token = token;
        req.user = user;
        next();
    });
};

module.exports = {auth};
