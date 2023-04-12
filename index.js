const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors')
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const mongoose = require("mongoose");
const {auth} = require("./middleware/auth");


mongoose.connect(config.mongoURI,
    {
        useNewUrlParser: true, useUnifiedTopology: true,
        useFindAndModify: false
    }
).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.use(cors(
    {
        origin: config.origin,
        optionsSuccessStatus: 200
    }
))

//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

//to get json data
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cookieParser());


//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use("/uploads", express.static(path.join(__dirname, '/uploads')));


/***
 * App routes declaration.
 */
app.use('/api/users', require('./routes/users'));
app.use('/api/add', auth, require('./routes/addData'));
app.use('/api/get', auth, require('./routes/getData'));
app.use('/api/pantry', auth, require('./routes/pantry'));

app.use('/public/get', require('./routes/publicAPI'));
app.use('/authentication', require('./routes/authenticaion_unsafe'));


const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`Server Listening on ${port}`)
});
