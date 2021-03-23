// ------ Importar dependencias ------
const express = require('express');
const dotenv = require('dotenv').config();
const {MongoClient} = require('mongodb');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const URL = process.env.MONGODB;
const optionsMongo = { useNewUrlParser: true, useUnifiedTopology: true } 

// ------ Configuración inicial ------
const server = express();
const listenPort = process.env.PORT || 8080;

// JSON support
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Levantar el Servidor
server.listen(listenPort,
    () => console.log(`Server listening on ${listenPort}`)
);

// PETICION POST (Crear Usuario with md5)
server.post('/user/create', (req, res) => {
    const newUser = { 
        user: req.body.user,
        pass: md5(req.body.pass)
    }

    MongoClient.connect(URL, optionsMongo, (err, db) => {
        try {
            db.db("users")
                .collection("Users")
                .insertOne(newUser, (err, result) => {
                    if (err) { 
                        if (err.code === 11000) {
                            res.send("User already exists")
                        } else {
                            console.log(err);
                        }
                    } else {
                        res.send("New user added")
                        db.close();
                    }
                })
        }
        catch(exception) {
            res.send("Check your database error")
        }
    })
})

// PETICION POST  (Login with md5 and returns TOKEN)
server.post('/user/login', (req, res) => {
    const USER = { 
        user: req.body.user,
        pass: md5(req.body.pass)
    }

    MongoClient.connect(URL, optionsMongo, (err, db) => {
        try {
            db.db("users")
                .collection("Users")
                .findOne(USER, (err, result) => {
                    if (err) throw err;

                    if (result === null) {
                        res.send("Contraseña/Usuario incorrectos")
                        console.log(result);
                    }
                    else {
                        // TOKEN JWT
                        let token = jwt.sign({ user: USER.user }, md5(process.env.SECRET))
                        res.send(token)
                        db.close();
                    }
                })
        }
        catch(exception) {
            res.send("Check your database error")
        }
    })
})

// PETICION DELETE 
server.delete('/user/delete', (req, res) => {
    const USER = {
        user: req.body.user,
        pass: md5(req.body.pass)
    }

    MongoClient.connect(URL, optionsMongo, (err, db) => {
        try {
            db.db("users")
                .collection("Users")
                .deleteOne(USER, (err, result) => {
                    if (result.deletedCount === 0){
                        res.status(400).json({
                            data: "User already does not exist",
                            ok: false,
                          })
                          db.close()
                    } else {
                        console.log(result);
                        res.send("User was deleted correctly")
                        db.close()
                    }
                })
    
        } catch {
            console.log(err);
            res.status(500).json({
              data: err,
              ok: false,
            })
        }
    })
})

server.get('/user/read', (req, res) => {
    
    // let verify = jwt.verify(req.headers.authorization, md5(process.env.SECRET));
    // console.log(verify);

    MongoClient.connect(URL, (err, db)=> {
        if (err) throw err;
        let data = db.db("users")
    
        data.collection("Users").find({}).toArray( (err, result) => {
            if (err) throw err;
            res.send(result.map(el => el));
            db.close();
        })
        console.log("Working tree clean");
    })
})

