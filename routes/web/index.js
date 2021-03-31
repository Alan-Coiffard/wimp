var express = require("express");

var router = express.Router();

// TODO: add in error and info

router.use(function(req, res, next){
  //console.log('Dans index : ', req.session);
  res.locals.user = req.session;
  next();
});

router.use("/", require("./home"));

router.use("/home", require("./home"));

router.use("/inscription", require("./home"));

router.use("/connexion", require("./home"));

router.use("/deconnexion", require("./home"));

router.use("/modifierProfil", require("./home"));

router.use("/flash", require("./home"));

router.use("/test", require("./home"));

module.exports = router;
