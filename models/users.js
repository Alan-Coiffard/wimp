const environment     = process.env.NODE_ENV || 'development';    // set environment
console.log(environment);
const configuration   = require('../knexfile')[environment];      // pull in correct db with env configs
const database        = require('knex')(configuration);           // define database based on above
const bcrypt          = require('bcrypt')                         // bcrypt will encrypt passwords to be saved in db
const crypto          = require('crypto')                         // built-in encryption node module

// Inscription
// app/models/user.js
const signup = (request, response) => {
  const user = request.body
  let { email, nom, prenom, password, password2 } = request.body;

  let errors = [];

  console.log({
    email,
    nom,
    prenom,
    password,
    password2
  });

  if (!nom || !prenom || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    response.render("home/inscription", { errors, nom, prenom, email, password, password2 });
  } else {
    findUser(user)
      .then(foundUser => {
        //console.log("foundUser", foundUser);
        if (!foundUser) {
          hashPassword(user.password)
            .then((hashedPassword) => {
              delete user.password
              user.password = hashedPassword
            })
            //.then(() => createToken())
            //.then(token => user.token = token)
            .then(() => createUser(user))
            .then(user => {
              delete user.password
              // response.status(201).json({ user })
              request.session.id_client = user.id_client;
              request.session.nom = user.nom;
              request.session.prenom = user.prenom;
              request.session.email = user.email;

              response.redirect('/home');
            })
            .catch((err) => console.error(err))
        } else {
          errors.push({ message: "Email already registered" });
          response.render("home/inscription", { errors, nom, prenom, email, password, password2 });
        }
        return foundUser
      })
      .catch((err) => console.error(err))
  }
}

// app/models/user.js
// check out bcrypt's docs for more info on their hashing function
const hashPassword = (password) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, 10, (err, hash) => {
      err ? reject(err) : resolve(hash)
    })
  )
}

// user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created
const createUser = (user) => {
  return database.raw(
    "INSERT INTO clients (nom, prenom, email, password) VALUES (?, ?, ?, ?) RETURNING id_client, nom, prenom, email, password",
    [user.nom, user.prenom, user.email, user.password]
  )
  .then((data) => data.rows[0])
}

const modifyUser = (user, userId) => {

  return database.raw(
    "UPDATE clients SET nom = ?, prenom = ?, email = ? WHERE id_client = ? RETURNING nom, prenom, email",
    [user.nom, user.prenom, user.email, userId]
  )
  .then((data) => data.rows[0])
}

// crypto ships with node - we're leveraging it to create a random, secure token
const createToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, data) => {
      err ? reject(err) : resolve(data.toString('base64'))
    })
  })
}

// app/models/user.js
const findUser = (userReq) => {
  return database.raw("SELECT * FROM clients WHERE email = ?", [userReq.email])
    .then((data) => data.rows[0])
}

const findUserByID = (userReq) => {
  return database.raw("SELECT * FROM clients WHERE email = ?", [userReq])
    .then((data) => data.rows[0])
}

const checkPassword = (reqPassword, foundUser) => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(reqPassword, foundUser.password, (err, response) => {
        if (err) {
          reject(err)
        }
        else if (response) {
          resolve(response)
        } else {
          reject(new Error('Passwords do not match.'))
        }
    })
  )
}

const updateUserToken = (token, user) => {
  return database.raw("UPDATE clients SET token = ? WHERE id_client = ? RETURNING id_client, nom, prenom, email, token", [token, user.id_client])
    .then((data) => data.rows[0])
}

// app/models/user.js
const authenticate = (userReq) => {
  findByToken(userReq.token)
    .then((user) => {
      if (user.email == userReq.email) {
        return true
      } else {
        return false
      }
    })
}

const findByToken = (token) => {
  return database.raw("SELECT * FROM clients WHERE token = ?", [token])
    .then((data) => data.rows[0])
}

const userPhotos = (request, response) => {
  const userReq = request.body
  if (authenticate(userReq)) {
      // handler logic goes here
   } else {
      response.status(404)
   }
}

const modifyProfil = (request, response) => {
  const user = request.body
  let { email, nom, prenom } = request.body;
  const userId = request.session.id_client;
  //console.log("User with id : ", userId);

  let errors = [];

  // console.log({
  //   email,
  //   nom,
  //   prenom
  // });

  if (!nom || !prenom || !email) {
    errors.push({ message: "Please enter all fields" });
  }

  if (errors.length > 0) {
    response.render("./profil", { errors, nom, prenom, email });
  } else {
    // modifyUser(user, userId)
    // .then(user => {
    //   // response.status(201).json({ user })
    //   request.session.id_client = userId;
    //   request.session.nom = user.nom;
    //   request.session.prenom = user.prenom;
    //   request.session.email = user.email;
    //
    //   response.redirect('./profil');
    // })
    // .catch((err) => console.error(err))
    findUser(user)
      .then(foundUser => {
        //console.log("foundUser", foundUser);
        //console.log("user mail : ", user.email);
        //console.log("foundUser mail : ", foundUser.email);
        if (!foundUser || foundUser.email != user.email) {
          modifyUser(user, userId)
          .then(user => {
            // response.status(201).json({ user })
            request.session.id_client = userId;
            request.session.nom = user.nom;
            request.session.prenom = user.prenom;
            request.session.email = user.email;

            response.redirect('./profil');
          })
          .catch((err) => console.error(err))
        } else {
          errors.push({ message: "Email already registered" });
          response.render("./profil", { errors, nom, prenom, email });
        }
        return foundUser
      })
      .catch((err) => console.error(err))
  }
}

// app/models/user.js
const signin = (request, response) => {
  const userReq = request.body
  let user

  findUser(userReq)
    .then(foundUser => {
      user = foundUser
      return checkPassword(userReq.password, foundUser)
    })
    .then(() => {
      delete user.password
      request.session.id_client = user.id_client;
      request.session.nom = user.nom;
      request.session.prenom = user.prenom;
      request.session.email = user.email;

      response.redirect('/home');
      //response.status(200).json(user);
    })
    .catch((err) => console.error(err))
}

// app/models/user.js
const findAll = (request, response) => {
  console.log("Entrer dans find");
  //console.log(request.session.id_client);
  let errors = []
  if (!request.session.id_client) {
    errors.push({ message: "Connectez-vous" });
  }
  if (errors.length > 0) {
    response.render("home/connexion", { errors });
  } else {
    // _findAnimal(request.session.id_client)
    //   .then(foundAnimals => {
    //     //console.log("This -----",foundAnimals.rows);
    //     animaux = foundAnimals.rows
    //     return animaux
    //   })
    //   .then(() => {
    //     request.session.animaux = animaux;
    //     //response.status(200).json(user);
    //   })
    //   .catch((err) => console.error(err))

    _findAnimal(request.session.id_client)
      .then(foundAnimals => {
        animaux = foundAnimals.rows
        return animaux
      })
      .then(() => {
        //console.log("Colliers: ", colliers);
        console.log("---------------------------------------------------------------------animaux");
        request.session.animaux = animaux;
        //response.redirect('./profil');
        //response.status(200).json(user);
      })
      .catch((err) => console.error(err))

    _findCollier(request.session.id_client)
      .then(foundCollier => {
        colliers = foundCollier.rows
        return colliers
      })
      .then(() => {
        //console.log("Colliers: ", colliers);
        console.log("---------------------------------------------------------------------colliers");
        request.session.colliers = colliers;
        response.redirect('./profil');
        //response.status(200).json(user);
      })
      .catch((err) => console.error(err))
  }
}

const _findAnimal = (id_client) => {
  let request = database.raw("SELECT colliers.id_collier, colliers.numero_collier, colliers.id_client, id_animal_collier, animaux.id_animal, nom_animal, naissance_animal, type_animal, distance, animaux.id_collier, id_utilisateur, AGE(naissance_animal) AS age_animal FROM animaux left join colliers on colliers.id_collier = animaux.id_collier WHERE id_utilisateur = ?", [id_client], (err, res) => {
    //console.log(err ? err.stack : "test ",res.rows[0]) // Hello World!
    database.end()
  })
  return request
}

const _findCollier = (id_client) => {
  let request = database.raw("SELECT * FROM colliers WHERE id_client = ?", [id_client], (err, res) => {
    //console.log(err ? err.stack : "test ",res.rows[0]) // Hello World!
    database.end()
  })
  return request
}

// const _findAnimal = (id_client) => {
//   return database.raw(
//     "SELECT colliers.id_collier, colliers.numero_collier, colliers.id_client, id_animal_collier, animaux.id_animal, nom_animal, naissance_animal, type_animal, distance, animaux.id_collier, id_utilisateur, AGE(naissance_animal) AS age_animal FROM animaux left join colliers on colliers.id_collier = animaux.id_collier WHERE id_utilisateur = ?"
//   )
//   .then((data) => {
//     console.log("Data dans _findAnimal : ", data.rows);
//     return data
//   })
// }

const findType = (request, response) => {

  //console.log(request.session.id_client);
  let errors = []
  if (!request.session.id_client) {
    errors.push({ message: "Connectez-vous" });
  }
  if (errors.length > 0) {
    response.render("home/connexion", { errors });
  }else {
    _findType(request.session.id_client)
      .then(foundType => {
        types = foundType.rows
        return types
      })
      .then(() => {
        //console.log("Colliers: ", colliers);
        request.session.types = types;
        response.render('home/home');
        //response.status(200).json(user);
      })
      .catch((err) => console.error(err))
  }
}

const _findType = (id_client)  => {
  //console.log(id_client);
  let request = database.raw("SELECT * FROM types")
  return request
}


/**************************Animal********************************/

//ajouter un animal

const ajoutAnimal = (request, response) => {
  const animal = request.body
  console.log(animal);
  let errors = [];
  let validate = [];
  let { nom_animal, type, naissance_animal, distance, id_collier } = request.body;
  let id_client = request.session.id_client;

  if (animal.distance == '') {
    animal.distance = null;
  }

  if (animal.id_collier == '') {
    animal.id_collier = null;
  }
  console.log(id_collier);
  if (!nom_animal || !type || !naissance_animal) {
    errors.push({ message: "Please enter all fields" });
  }
  if (request.session.colliers.id_animal != null) {
    errors.push({ message: "Le collier est déjà utilisé" });
  }

  if (errors.length > 0) {
    response.render("./profil", errors);
  } else {
    createAnimal(animal, id_client)
    .then(() => {
      request.session.validate = "animal Bien ajouté !";
      validate.push({ message: "Animal bien ajouté !" });
      response.redirect("./profil");
    })
    .catch((err) => console.error(err))
  }
}

// user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created

//UPDATE clients SET nom = ?, prenom = ?, email = ? WHERE id_client = ? RETURNING nom, prenom, email
const createAnimal = (animal, id_client) => {
  return database.raw(
    "INSERT INTO animaux (nom_animal, naissance_animal, type_animal, distance, id_collier, id_utilisateur) VALUES (?, ?, ?, ?, ?, ?) RETURNING id_animal, nom_animal, naissance_animal, type_animal, distance, id_collier, id_utilisateur",
    [animal.nom_animal, animal.naissance_animal, animal.type, animal.distance, animal.id_collier, id_client]
  )
  .then((data) => {
    data.rows[0]
    return database.raw(
      "UPDATE colliers SET id_animal_collier = ? WHERE id_collier = ?",
      [data.rows[0].id_animal, data.rows[0].id_collier]
    )
  })
}

// const findAnimalById = (animalReq) => {
//   return database.raw("SELECT * FROM animaux WHERE id_animal = ?", [animalReq])
//     .then((data) => data.rows[0])
// }


const findAnimalById = (id_animal) => {
  let request = database.raw("SELECT colliers.id_collier, colliers.numero_collier, colliers.id_client, id_animal_collier, animaux.id_animal, nom_animal, naissance_animal, type_animal, distance, animaux.id_collier, id_utilisateur, AGE(naissance_animal) AS age_animal FROM animaux left join colliers on colliers.id_collier = animaux.id_collier WHERE id_animal = ?", [id_animal], (err, res) => {
    //console.log(err ? err.stack : "test ",res.rows[0]) // Hello World!
    database.end()
  })
  return request
}

const supprimerAnimal = (request, response) => {
  console.log("Les cookies ", request.cookies.id);
  let errors = []
  let id_animal = request.cookies.id;
  findAnimalById(id_animal)
    .then(foundAnimal => {
      console.log("Found animal : ", foundAnimal);
      if (foundAnimal) {
        return database.raw(
          "UPDATE colliers SET id_animal_collier = ? WHERE id_collier = ?",
          [null, foundAnimal.id_collier]
        )
        .then(() => {
          return database.raw(
            "DELETE FROM animaux WHERE id_animal = ?",
            [foundAnimal.id_animal]
          )
          .then(() => {
            response.redirect('/find');
          })
          .catch((err) => {
            console.error(err)
            errors.push({ message: err.detail });
            response.redirect("./profil", { errors });
          })
        })
        .catch((err) => {
          console.error(err)
          errors.push({ message: err.detail });
          response.redirect("./profil", { errors });
        })
      } else {
        errors.push({ message: "Vous n'avez pas cet animal" });
        response.redirect("./profil", { errors });
      }
      return foundAnimal
    })
    .catch((err) => {
      console.error(err)
      errors.push({ message: err.detail });
      response.render("./profil", { errors });
    })
}

/**************************Collier********************************/

//ajouter un collier

const ajoutCollier = (request, response) => {

  const collier = request.body
  //console.log("Collier : ", collier);
  let errors = [];
  let validate = [];
  let { numero_collier } = request.body;
  let id_client = request.session.id_client;

  if (!numero_collier) {
    errors.push({ message: "Please enter all fields" });
  }

  if (errors.length > 0) {
    response.render("./profil", errors);
  } else {
    findCollier(collier)
      .then(foundCollier => {
        //console.log("foundUser", foundUser);
        //console.log("user mail : ", user.email);
        //console.log("foundUser mail : ", foundUser.email);
        if (!foundCollier) {
          createCollier(collier, id_client)
          .then(collier => {
            response.redirect('/find');
          })
          .catch((err) => {
            console.error(err)
          })
        } else {
          errors.push({ message: "Numéro de collier déjà utilisé" });
          response.render("./profil", { errors });
        }
        return foundCollier
      })
      .catch((err) => console.error(err))
  }
}

const findCollier = (collierReq) => {
  return database.raw("SELECT * FROM colliers WHERE numero_collier = ?", [collierReq.numero_collier])
    .then((data) => data.rows[0])
}
// user will be saved to db - we're explicitly asking postgres to return back helpful info from the row created

//UPDATE clients SET nom = ?, prenom = ?, email = ? WHERE id_client = ? RETURNING nom, prenom, email
const createCollier = (collier, id_client) => {
  return database.raw(
    "INSERT INTO colliers (numero_collier, id_client) VALUES (?, ?) RETURNING id_collier, numero_collier, id_client",
    [collier.numero_collier, id_client]
  )
  .then((data) => {
    data.rows[0]
  })
  .catch((err) => {
    console.error(err)
  })
}

const findCollierById = (collierReq) => {
  return database.raw("SELECT * FROM colliers WHERE id_collier = ?", [collierReq])
    .then((data) => data.rows[0])
}

const supprimerCollier = (request, response) => {
  let errors = []
  let id_collier = request.cookies.id;
  findCollierById(id_collier)
    .then(foundCollier => {
      console.log(foundCollier);
      if (foundCollier) {
        return database.raw(
          "DELETE FROM colliers WHERE id_collier = ?",
          [foundCollier.id_collier]
        )
        .then(() => {
          response.redirect('/find');
          //response.redirect('/find');
        })
        .catch((err) => {
          console.error(err)
          errors.push({ message: "Le collier est toujours utilisé" });
          response.render("./profil", { errors });
        })
      } else {
        errors.push({ message: "Vous n'avez pas ce collier" });
        response.render("./profil", { errors });
      }
      return foundCollier
    })
    .catch((err) => console.error(err))
}


const modifierAnimal = (request, response) => {
  let id_animal = request.cookies.id;
  findAnimalById(id_animal)
    .then(foundAnimal => {
      //animaux = foundAnimals.rows
      request.session.modifierAnimal = foundAnimal.rows;
      response.render("_partial/profil/modifier/_modifier_animal");
    })
    .catch((err) => console.error(err))
}

// don't forget to export!
module.exports = {
  signup,
  signin,
  modifyProfil,
  findAll,
  findType,
  ajoutAnimal,
  ajoutCollier,
  supprimerCollier,
  supprimerAnimal,
  modifierAnimal
}
