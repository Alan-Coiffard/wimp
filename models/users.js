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
        console.log("foundUser", foundUser);
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
  console.log("User with id : ", userId);

  let errors = [];

  console.log({
    email,
    nom,
    prenom
  });

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
const findAnimal = (request, response) => {
  console.log(request.session.id_client);
  _findAnimal(request.session.id_client)
    .then(foundAnimals => {
      console.log(foundAnimals.rows);
      animaux = foundAnimals.rows
      return animaux
    })
    .then(() => {
      console.log("Animaux: ", animaux);
      request.session.animaux = animaux;
      //response.status(200).json(user);
    })
  _findCollier(request.session.id_client)
    .then(foundCollier => {
      console.log(foundCollier.rows);
      colliers = foundCollier.rows
      return colliers
    })
    .then(() => {
      console.log("Colliers: ", colliers);
      request.session.colliers = colliers;
      response.redirect('/profil');
      //response.status(200).json(user);
    })
}

const _findAnimal = (id_client) => {

  let request = database.raw("SELECT * FROM animaux WHERE id_utilisateur = ?", [id_client], (err, res) => {
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

// don't forget to export!
module.exports = {
  signup,
  signin,
  modifyProfil,
  findAnimal
}
