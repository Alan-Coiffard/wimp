const User = require('../../models/users.js');

var express = require("express");
var passport = require('passport');
const bcrypt = require('bcrypt');

var JSAlert = require("js-alert");

var router = express.Router();

router.get("/", function(req, res){
  console.log("accueil page charged");
  req.flash('info', 'hello!');
  res.render("home/index");
});

router.get('/home', User.findType);

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

router.get("/connexion", function(req, res){
  console.log("connexion page charged");
  res.render("home/connexion");
});

router.get("/inscription", function(req, res){
  console.log("inscription page charged");
  res.render("home/inscription");
});

router.get("/deconnexion", function(req, res){
  let errors = []
  if (!req.session.id_client) {
    errors.push({ message: "Connectez-vous" });
  }
  if (errors.length > 0) {
    res.render("home/connexion", { errors });
  } else {
    req.session.destroy(function(err) {
      res.redirect('/');
    })
  }
});

router.get('/find', User.findAll);
router.get('/findHome', User.findHome);

router.get("/profil", function(req, res){
  console.log("profil page charged");
  res.render("profil");
});

router.post('/inscription', User.signup);
router.post('/connexion', User.signin);
router.post('/modifierProfil', User.modifyProfil);



router.post('/ajoutAnimal', User.ajoutAnimal);
router.get('/supprimerAnimal', User.supprimerAnimal);

router.get('/entreModif', User.entreModif);
router.get('/sortiModif', User.sortiModif);
router.post('/modifierAnimal', User.modifierAnimal);

//router.post('/supprimerAnimal', User.supprimerAnimal);

// router.post('/supprimerAnimal', function(req, res){
//   //res.render('_partial/profil/supprimer/_supprimer_Animal');
//   JSAlert.alert("This is an alert.");
//
// });
//showAlert(error.message);

router.post('/ajoutCollier', User.ajoutCollier);
router.get('/supprimerCollier', User.supprimerCollier);


module.exports = router;
