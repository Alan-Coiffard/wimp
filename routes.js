const express = require('express');

const router = express.Router();

router.get("/", function(req, res){
  console.log("accueil page charged");
  res.render("index");
});

router.get("/home", function(req, res){
  console.log("Home page charged");
  res.render("home");
});

router.get("/connexion", function(req, res){
  console.log("connexion page charged");
  res.render("connexion");
});

router.get("/inscription", function(req, res){
  console.log("inscription page charged");
  res.render("inscription");
});

router.get("/profil", function(req, res){
  console.log("profil page charged");
  res.render("profil");
});


/*--------------Page de test-------------------*/
router.get("/test", function(req, res){
  console.log("inscription page charged");
  res.render("test");
});


module.exports = router;
