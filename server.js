const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const app = express();

//fusion avec la collection 'personne'
let vLookup = {$lookup:
  {
      from: 'personne',
      localField: 'id_proprietaire',
      foreignField: '_id',
      as: 'proprietaire'
  }};

  // projection
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

// si on rencontre une erreur en éxécutant une requete
function erreurRequete(error, results){
  console.log("La requête a échoué");
  throw error;
}

// affiche grace au template home.ejs le resultat de la requete
function displayRender(resultat, renvoi){
  resultat.render('home.ejs', {bdd : renvoi});
}

// affiche la totalité de la BDD sur la page d'accueil
async function displayHome(req, res){
  // extraction des données depuis mongoDB
  let requete = await db.collection("chats").aggregate(vLookup, vProject).toArray();
  displayRender(res, requete);
}

//affiche le résultat d'une recherche par nom
async function displayRechercheNom(req, res){
  // extraction des données depuis mongoDB
  let requete = await db.collection("chats").aggregate({$match : {nom : req.param("nom")}}, vLookup, vProject).toArray();
  displayRender(res, requete);
}

//affiche le résultat d'une recherche par couleur
async function displayRechercheCouleur(req, res){
  // extraction des données depuis mongoDB
  let requete = await db.collection("chats").aggregate({$match : {couleur : req.param("couleur")}}, vLookup, vProject).toArray();
  displayRender(res, requete);
}

//ajoute un chat dans la BDD
async function addChat(req, res){


  let myobj = { nom: req.param("nom"), annee_nais: req.param("annee_nais"), couleur: [req.param("couleur1"), req.param("couleur2"), req.param("couleur3")],
  annee_adopt : req.param("annee_adopt") };

  db.collection("chats").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
 });
}

// ajoute une personne dans la bdd
function addPersonne(req, res){
  let myobj = {nom: req.param("nom_prop"), prenom: req.param("prenom_prop"),
  annee_nais: req.param("annee_nais_prop"), adresse: {numero: req.param("numero"), rue: req.param("rue"), ville: req.param("ville") } };

  db.collection("personne").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("Une nouvelle personne a été créée");
 });
}

// fonction principale avec les routes
function startApp(){
  app.get('/', displayHome);
  app.get('/rechercheNom', displayRechercheNom);
  app.get('/rechercheCouleur', displayRechercheCouleur);
  app.get('/ajoutChat', addChat);
  app.get('/ajoutPersonne', addPersonne);
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
