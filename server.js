const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const app = express();

// si on rencontre une erreur en éxécutant une requete
function erreurRequete(error, results){
  console.log("La requête a échoué");
  throw error;
}

//si on ne rencontre pas d'erreur
function reussiteRequete(error, results){
  //res.render('home.ejs', {bdd : results});
}

// affiche la totalité de la BDD sur la page d'accueil
function displayHome(req, res){
  // extraction des données depuis mongoDB
  let vLookup = {$lookup:
    {
        from: 'personne',
        localField: 'id_proprietaire',
        foreignField: '_id',
        as: 'proprietaire'
    }};

    let vProject = {
    $project: {
        _id: 0,
        nom: 1,
        couleur: 1,
        annee_nais : 1,
        annee_adopt : 1,
        "proprietaire.nom" : 1,
        "proprietaire.prenom" : 1,
        "proprietaire.adresse.numero" :1,
        "proprietaire.adresse.rue" : 1,
        "proprietaire.adresse.ville":1
    }};


  db.collection("chats").aggregate(vLookup, vProject).toArray(function (error, results) {
      if (error) throw error;
      res.render('home.ejs', {bdd : results});
  });
}

//affiche le résultat d'une recherche par nom
function displayRechercheNom(req, res){
  // extraction des données depuis mongoDB
  client.connect(function(error, client) {
          if (error) throw error;
          const db = client.db('adopte_un_chaton');
      db.collection("chats").find({nom : req.param("nom")}).toArray(function (error, results) {
          if (error) throw error;
          res.render('home.ejs', {bdd : results});
      });
      console.log("Connecté à la base de données des chats");
  });
}

//affiche le résultat d'une recherche par couleur
function displayRechercheCouleur(req, res){
  // extraction des données depuis mongoDB
  client.connect(function(error, client) {
          if (error) throw error;
          const db = client.db('adopte_un_chaton');
      db.collection("chats").find({couleur : req.param("couleur")}).toArray(function (error, results) {
          if (error) throw error;
          res.render('home.ejs', {bdd : results});
      });
      console.log("Connecté à la base de données des chats");
  });
}

//ajoute un chat dans la BDD
function addChat(req, res){
  // extraction des données depuis mongoDB
  client.connect(function(error, client) {
          if (error) throw error;
          const db = client.db('adopte_un_chaton');
          let myobj = { nom: req.param("nom"), annee_nais: req.param("annee_nais"), couleur: req.param("couleur"),
          annee_adopt : req.param("annee_adopt"), proprietaire: {nom: req.param("nom_prop"), prenom: req.param("prenom_prop"),
          annee_nais: req.param("annee_nais_prop"), adresse: {numero: req.param("numero"), rue: req.param("rue"), ville: req.param("ville") }} };

          db.collection("chats").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
         });
      console.log("Connecté à la base de données des chats");
  });
}

// fonction principale avec les routes
function startApp(){
  app.get('/', displayHome);
  app.get('/rechercheNom', displayRechercheNom);
  app.get('/rechercheCouleur', displayRechercheCouleur);
  app.get('/ajout', addChat);
  app.listen(8080);
}


// --------- Connexion à la BDD ----------- //
// on instancie un client
const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// on initialise la connexion
client.connect(function(error){
    if(error) {
        throw error;
    } else {
        startApp();
    }
});
//accès à la base de données
const db = client.db('adopte_un_chaton');
