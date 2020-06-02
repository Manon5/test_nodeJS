var express = require('express');
var MongoClient = require("mongodb").MongoClient;

var app = express();



app.get('/', function(req, res) {
    // extraction des données depuis mongoDB
    MongoClient.connect("mongodb://localhost:27017", function(error, client) {
            if (error) throw error;
            var db = client.db('adopte_un_chaton');
        db.collection("chats").find().toArray(function (error, results) {
            if (error) throw error;
            console.log(results.length);
            res.render('home.ejs', {bdd : results});
        });
        console.log("Connecté à la base de données des chats");
    });
});

app.get('/rechercheNom', function(req, res) {
    // extraction des données depuis mongoDB
    MongoClient.connect("mongodb://localhost:27017", function(error, client) {
            if (error) throw error;
            var db = client.db('adopte_un_chaton');
        db.collection("chats").find({nom : req.param("nom")}).toArray(function (error, results) {
            if (error) throw error;
            res.render('home.ejs', {bdd : results});
        });
        console.log("Connecté à la base de données des chats");
    });
});

app.get('/rechercheCouleur', function(req, res) {
    // extraction des données depuis mongoDB
    MongoClient.connect("mongodb://localhost:27017", function(error, client) {
            if (error) throw error;
            var db = client.db('adopte_un_chaton');
        db.collection("chats").find({couleur : req.param("couleur")}).toArray(function (error, results) {
            if (error) throw error;
            res.render('home.ejs', {bdd : results});
        });
        console.log("Connecté à la base de données des chats");
    });
});

app.get('/ajout', function(req, res) {
    // extraction des données depuis mongoDB
    MongoClient.connect("mongodb://localhost:27017", function(error, client) {
            if (error) throw error;
            var db = client.db('adopte_un_chaton');
            var myobj = { nom: req.param("nom"), annee_nais: req.param("annee_nais"), couleur: req.param("couleur"),
            annee_adopt : req.param("annee_adopt"), proprietaire: {nom: req.param("nom_prop"), prenom: req.param("prenom_prop"),
            annee_nais: req.param("annee_nais_prop"), adresse: {numero: req.param("numero"), rue: req.param("rue"), ville: req.param("ville") }} };

            db.collection("chats").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
           });
        console.log("Connecté à la base de données des chats");
    });
});


app.listen(8080);
