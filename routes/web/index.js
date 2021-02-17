var express = require("express");

var router = express.Router();

//// TODO: add in error and info

router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

router.use("/", require("./home"));

router.use("/home", require("./home"));

router.use("/inscription", require("./home"));

router.use("/connexion", require("./home"));

router.use("/flash", require("./home"));

router.use("/test", require("./home"));

module.exports = router;
