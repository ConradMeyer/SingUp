// ------ Importar dependencias ------
const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv').config();
const {MongoClient} = require('mongodb');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const randomstring = require("randomstring");
const URL = process.env.MONGODB;
const optionsMongo = { useNewUrlParser: true, useUnifiedTopology: true } 

// ------ Configuración inicial ------
const server = express();
const listenPort = process.env.PORT || 8080;
server.use(cors());

// HAY QUE APUNTAR AL FRONT ("/Public")
const staticFilesPath = express.static(__dirname + '/public');
server.use(staticFilesPath);

// JSON support
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Levantar el Servidor
server.listen(listenPort,
    () => console.log(`Server listening on ${listenPort}`)
);

// VALIDATION
const validarEmail = mail => (/^\w+([\.-]?\w+)*@(?:|hotmail|outlook|yahoo|live|gmail)\.(?:|com|es)+$/.test(mail));
const validarPass = pass => (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pass));

// PETICION POST (Crear Usuario with md5)
server.post('/user/create',  (req, res) => {
    const newUser = { 
        name: req.body.name,
        user: req.body.user,
        pass: md5(req.body.pass),
        secret: randomstring.generate()
    }

    if (validarEmail(req.body.user) && validarPass(req.body.pass)){
        MongoClient.connect(URL, optionsMongo, (err, db) => {
            try {
                db.db("users")
                    .collection("Users")
                    .insertOne(newUser, (err, result) => {
                        if (err) { 
                            if (err.code === 11000) {
                                res.redirect(400, "/user/login")
                            } else {
                                res.send(err)
                                console.log(err);
                            }
                        } else {
                            res.redirect(200, "/user/login")
                            db.close();
                        }
                    })
            }
            catch(exception) {
                res.send("Check your database error")
                console.log("error 3");
            }
        })
    } else {
        res.status(406).json({
            data: "Email no valido / la contraseña debe contener 8 digitos y como minimo una letra y un numero",
            ok: false,
        })
    }
})

// PETICION POST  (Login with md5 and returns TOKEN)
server.post('/user/login', (req, res) => {
    const USER = { 
        user: req.body.user,
        pass: md5(req.body.pass)
    }

    if (validarEmail(req.body.user)) {
        MongoClient.connect(URL, optionsMongo, (err, db) => {
            try {
                db.db("users")
                    .collection("Users")
                    .findOne(USER, (err, result) => {
                        if (err) throw err;
                        if (result === null) {
                            res.status(401).json({
                                data: "Email o contraseña incorrect@s",
                                ok: false,
                            })
                        }
                        else {
                            // TOKEN JWT
                            let token = jwt.sign({ user: USER.user }, result.secret, {expiresIn: 60*60})
                            res.status(200).json({
                                data: token,
                                ok: false,
                            })
                            db.close();
                        }
                    })
            }
            catch(exception) {
                res.send("Error con la base de datos")
            }
        })
    } else {
        res.status(400).json({
            data: "Email no valido, debes meter un correo correcto",
            ok: false,
        })
    }
})

// PETICION DELETE 
server.delete('/user/delete', (req, res) => {
    const USER = {
        user: req.body.user,
        pass: md5(req.body.pass)
    }

    if (validarEmail(req.body.user)) {
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
    } else {
        res.send("Usuario o contraseña incorrecto")
    }
})

// LEER INFO VERIFICANDO TOKEN
server.get('/user/read', (req, res) => {
    try {
        let tokenArr = req.headers.authorization.split(" ");
        let decode = jwt.decode(tokenArr[1]);
        if (decode.user){
            MongoClient.connect(URL, (err, db)=> {
                try {
                    db.db("users")
                        .collection("Users")
                        .findOne({user: decode.user}, (err, result) => {
                            try {
                                let verify = jwt.verify(tokenArr[1], result.secret)
                                if (verify) {
                                    res.send(result)
                                    db.close();
                                }
                            }
                            catch {
                                res.status(401).json({
                                    data: "Algo va mal... La sesión ha caducado",
                                    ok: false,
                                })
                                console.log(err);
                            }
                        })
                }
                catch {
                    console.log(err);
                    res.send("Something working wrong with database")
                }
            })
        }
    } catch {
        res.status(401).json({
            data: "EL token no es valido",
            ok: false,
        })
    }
})

// LOGOUT (Cargarse el puto token)
server.get('/user/logout', (req, res) => {
    try {
        let tokenArr = req.headers.authorization.split(" ");
        let decode = jwt.decode(tokenArr[1]);
        if (decode.user){ 
            MongoClient.connect(URL, (err, db)=> {
                try {
                    db.db("users")
                        .collection("Users")
                        .updateOne({user: decode.user}, {$set: {secret: randomstring.generate()}}, (err, result) => {
                            try {
                                res.send("Logged out correctly")
                                db.close();
                            }
                            catch {
                                res.status(401).json({
                                    data: "Algo va mal... ",
                                    ok: false,
                                })
                                console.log(err);
                            }
                        })
                }
                catch {
                    res.status(401).json({
                        data: "Algo va mal... No conecta",
                        ok: false,
                    })
                }
            })
        }
    }
    catch{
        res.status(401).json({
            data: "¡No tienes token chaval!",
            ok: false,
        })
    }
})