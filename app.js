const express = require("express");
const bcrypt = require('bcrypt');
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();

const path = require('path');


var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.use(session({
  secret:"qsdqsdfq54sdffdqsdf684",
  resave:false,
  saveUninitialized:false,
  cookie: {
    maxAge: 3600000
  }
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
//   res.json({message: 'Votre requête'});
//   next();
// })


app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

app.listen(app.get('port'), function(){
  var os = require('os');
  console.log(os.platform());
  console.log("Server started");
});
