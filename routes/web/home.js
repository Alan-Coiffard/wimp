const User = require('../../models/users.js');

var express = require("express");
var passport = require('passport');
const bcrypt = require('bcrypt');


var router = express.Router();

router.get("/", function(req, res){
  console.log("accueil page charged");
  req.flash('info', 'hello!');
  res.render("home/index");
});

router.get("/home", function(req, res){
  console.log("Home page charged");
  res.render("home/home");
  //console.log(req.session);
  req.flash('info', 'Welcome');
});

router.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!');
  console.log('info');
  res.redirect('/');
});

router.get("/test", function(req, res){
  console.log("profil page charged");
  res.render("test");
});

router.get("/profil", function(req, res){
  console.log("profil page charged");
  res.render("profil");
});

router.get("/autreprofil", function(req, res){
  console.log("profil page charged");
  res.render("autreProfil");
});

router.get("/connexion", function(req, res){
  console.log("connexion page charged");
  res.render("home/connexion");
});

router.get("/inscription", function(req, res){
  console.log("inscription page charged");
  res.render("home/inscription");
});

router.get("/deconnexion", function(req, res){
  req.session.destroy(function(err) {
    res.redirect('/');
  })
});

router.post('/inscription', User.signup);
router.post('/connexion', User.signin);
router.post('/modifierProfil', User.modifyProfil);


module.exports = router;
