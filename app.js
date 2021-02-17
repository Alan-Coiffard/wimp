const express = require('express');
const path = require('path');

var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');

var params = require("./params/params");

var setUpPassport = require("./setUpPassport");

const app = express();

mongoose.connect(params.DATABASECONNECTION, {useUnifiedTopology:true, useNewUrlParser:true, useCreateIndex:true});
setUpPassport();
//const routes = require('./routes')

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
  secret:"qsdqsdfq54sdffdqsdf684",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use("/", require("./routes/web"));
app.use("/api", require("./routes/api"));

app.listen(app.get('port'), function(){
  var os = require('os');
  console.log(os.platform());
  console.log("Server started");
});
