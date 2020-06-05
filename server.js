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

function displayAdoptionRender(resultat, renvoiChat, renvoiPers){
  resultat.render('adoption.ejs', {cats : renvoiChat, persons: renvoiPers});
}

function displayChatParVille(resultat, listeChats, nbChat, ville){
  resultat.render('chatparville.ejs', {bdd : listeChats, v: ville, nbC: nbChat});
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
  let myobj = {nom: req.param("nom"), annee_nais: req.param("annee_nais"), couleur: [req.param("couleur1"), req.param("couleur2"), req.param("couleur3")],
  annee_adopt : "", id_proprietaire : ""};
  let add = await db.collection("chats").insertOne(myobj);
  console.log("Chat inséré dans la base de données");
}

// ajoute une personne dans la bdd
async function addPersonne(req, res){
  let myobj = {nom: req.param("nom_prop"), prenom: req.param("prenom_prop"),
  annee_nais: req.param("annee_nais_prop"), adresse: {numero: req.param("numero"), rue: req.param("rue"), ville: req.param("ville") } };

  let add = await db.collection("personne").insertOne(myobj);
  console.log("Personne insérée dans la base de données");
}

// permet à une personne enregistrée dans la BdD d'adopter un chat
async function displayAdoption(req, res){
  let requeteChat = await db.collection("chats").find({id_proprietaire : ""}).toArray();
  let requetePers = await db.collection("personne").find().toArray();
  displayAdoptionRender(res, requeteChat, requetePers);
}

// ajoute l'adoption demandée
async function adopter(req, res){
  let i = 0;
  while(req.query["proprietaire"][i] !== " "){
    i++;
  }
  // on sépare le nom du prénom (séparé par un espace dans req)
  let nom_p = req.query["proprietaire"].substr(0, i);
  let prenom_p = req.query["proprietaire"].substr(i+1);

  // à partir du nom et prénom, on récupère l'id de la personne
  let prop = await db.collection("personne").find({nom : nom_p, prenom: prenom_p}).toArray();
  let id_prop = prop[0]._id;

  // on update le fichier du chat pour afficher le nouveau propriétaire
  let adopt = db.collection("chats").updateOne({nom: req.query["chat"]}, { $set :{id_proprietaire : id_prop}});
  console.log("Adoption réussie !")
  //let arr = await Promise.all([adopt, id_prop]);
}

// affiche le nombre de chats adoptés dans une ville donnée
async function displayRechercheVille(req, res){
  // extraction des données depuis mongoDB
  let requete = await db.collection("chats").aggregate(vLookup, {$match : {"proprietaire.adresse.ville" : req.query["ville"]}}, vProject).toArray();
  displayChatParVille(res, requete, requete.length, req.query["ville"]);
}

//affiche le résultat d'une recherche par 2 couleurs (OU logique)
async function displayRecherche2Couleurs(req, res){
  // extraction des données depuis mongoDB
  let requete = await db.collection("chats").aggregate({$match : {$or : [{couleur : req.query["color1"]}, {couleur: req.query["color2"]}]}}, vLookup, vProject).toArray();
  displayRender(res, requete);
}

// affiche le formulaire pour rechercher par villes
async function displayRechercheVilles(req, res){
  // on affiche le formulaire de recherche
  res.render('rechercheparvilles.ejs', {nb : req.query["nbVilles"]});
}

// affiche le résultat de la recherche par villes
async function displayNombreParVilles(req, res){
  // on récupère le nombre de villes passées en paramètre
  let nbVilles = 0;
  let listeVilles = [];
  for(e in req.query) {
    nbVilles++
    listeVilles.push(req.query["v" + (nbVilles)]);
  }
  let requete = await db.collection('chats').aggregate([vLookup, {$match : {"proprietaire.adresse.ville" : {"$in" : listeVilles}}}, {$count : "nb_chats"}]).toArray()

  res.render('compteparville.ejs', {nbC : requete[0].nb_chats, lV: listeVilles, nbV : nbVilles});

}



// fonction principale avec les routes
function startApp(){
  app.get('/', displayHome);
  app.get('/rechercheNom', displayRechercheNom);
  app.get('/rechercheCouleur', displayRechercheCouleur);
  app.get('/ajoutChat', addChat);
  app.get('/ajoutPersonne', addPersonne);
  app.get('/adoption', displayAdoption);
  app.get('/adopte', adopter);
  app.get('/rechercheVille', displayRechercheVille);
  app.get('/rechercheVilles', displayRechercheVilles);
  app.get('/rechercheDeuxCouleurs', displayRecherche2Couleurs)
  app.get('/compteParVilles', displayNombreParVilles)
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
