var session = require('../config/database')
var neo4j = require('neo4j-driver')

//FUNCIONES
function remove (req,res) {
    console.log('Eliminando el usuario con ID: '+req.body.id)
    session
    .run('MATCH (n:USER) WHERE id(n)=$id DELETE n', {
        id: req.body.id
    })
    .then(function (result) {
        console.log("El usuario ha sido eliminado con éxito");
        res.status(200).send("Usuario eliminado");
    }).catch(function (err) {
        console.log(err);
        res.send(err);
    }) 
}

function add(req,res) {
    //Comprobamos primero que no existe?
    //Tratamiento de errores
    console.log('Añadiendo un nuevo usuario')
    session
    .run('CREATE (n:USER {name: $nombre, email: $email, password: $password}) RETURN n', { 
        nombre: req.body.nombre, 
        email: req.body.email,
        password: req.body.password
    })
    .then(function (result) {
        var user=[];
        result.records.forEach(function (record) {
            user.push({
                id: record._fields[0].identity.low,
                name: record._fields[0].properties.name,
                email: record._fields[0].properties.email
            })
        })
        console.log(user);
        res.status(200).json(user);
    })
    .catch(function (err) {
        console.log(err);
        res.send("no se ha podido crear el usuario: \n" + err)
    })
}

function getAll(req, res) {
    console.log('Devolviendo todos los usuarios');
    session
    .run('MATCH (n:READER) RETURN n')
    .then( function (result) {
        var user = [];
        result.records.forEach(function (record) {
            user.push({
                id: record._fields[0].identity.low,
                name: record._fields[0].properties.name
            })           
        })
        console.log(user);
        res.json(user);
    })
    .catch(function(err) {
        console.log(err);
    })
}
function getOne(req, res) {
    //var id=req.params.id;
    console.log('Devolviendo el usuario con id = ' + req.params.id);

    session
    .run('MATCH(n:READER) WHERE id(n) = $id RETURN n', {
        id:neo4j.int(req.params.id)
    })
    .then(function (result) {
        console.log(result)
        var user = []
        result.records.forEach(function (record) {
            user.push({
                id: record._fields[0].identity.low,
                name: record._fields[0].properties.name
            })           
        })
        console.log(user);
        res.json(user);   
    })
    .catch(function (err) {
        console.log(err)
        res.status(404).send(err);
    })
}

//devuelve los libros leidos del usuario especificado
function getBooks (req, res) {
    console.log('Devolviendo los libros leidos por el usuario '+ req.params.id)
    session
    .run('MATCH (n:READER)-[r:READ]->(b:BOOK) WHERE id(n)=$id RETURN b,r', {
        id: neo4j.int(req.params.id)
    })
    .then(function (result) {
        var libros = []
        result.records.forEach(function (record) {
            libros.push({
                id: record.get('b').identity.low,
                titulo: record.get('b').properties.title,
                nota: record.get('r').properties.grade.low
            })
        })
        console.log(result)
        console.log(libros)
        res.send(libros);
    })
    .catch(function (err) {
        console.log(err);
        res.send(err);
    })
}
//Autentica al usuario
function authenticate (req,res) {
    console.log('Autentificando al usuario');
    var user = req.body.user;
    var pw = req.body.pass;
    console.log('Usuario: '+user);
    console.log('Password: '+ pw);

    session.run('MATCH(n:READER) WHERE name = ' + user + ' AND password = ' + pw)
    .then(function (result) {
        var user = []
        result.records.forEach(function (record) {
            user.push ({
                id: record._fields[0].identity.low,
                name: record._fields[0].properties.name
            })
        })
        if (user.length!=0) {
            console.log(user);
            res.json(user);
        } else {
            console.log('Combinación usuario/contraseña incorrectos')
            res.status(401.1).send('Email/Contraseña incorrectos');
        }
        
    })
    .catch(function (err) {
        console.log(err);
        res.status(404).send(err);
    })

}

module.exports = {
    getAll,getOne, getBooks, add, remove,authenticate
}