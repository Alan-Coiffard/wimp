var express = require("express");
var passport = require('passport');

var User = require("../../models/users");

var router = express.Router();

router.get("/", function(req, res){
  console.log("accueil page charged");
  res.render("home/index");
});

router.get("/home", function(req, res){
  console.log("Home page charged");
  res.render("home/home");
});

router.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!');
  console.log('info');
  res.redirect('/');
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

router.post("/connexion", passport.authenticate("login", {
  successRedirect:"/home",
  failureRedirect:"/connexion",
  failureFlash:true
}));

router.get("/deconnexion", function(req, res){
  req.logout();
  res.redirect("/");
});

router.post("/inscription", function(req, res, next){
  var nom       = req.body.nom;
  var prenom    = req.body.prenom;
  var email     = req.body.email;
  var password  = req.body.password;

  console.log(nom);
  console.log(prenom);
  console.log(email);
  console.log(password);

  User.findOne({email: email}, function(err, user){
    if(err){return next(err);}
    if (user) {
      req.flash("error", "Il y a déjà un compte avec cette adresse mail");
      return res.redirect("/inscription");
    }
    var newUser = new User({
      nom:      nom,
      prenom:   prenom,
      email:    email,
      password: password
    });

    newUser.save(next);
  });

}, passport.authenticate("login", {
  successRedirect:"/home",
  failureRedirect:"/inscription",
  failureFlash:true
}));

module.exports = router;
