var session = require('../config/database')
var neo4j = require('neo4j-driver')

//FUNCIONES
function remove (req,res) {
    console.log('Eliminando el libro con ID: '+req.body.id)
    session
    .run('MATCH (n:BOOK) WHERE id(n)=$id DELETE n', {
        id: req.body.id
    })
    .then(function (result) {
        console.log("El libro ha sido eliminado con éxito");
        res.status(200).send("libro eliminado");
    }).catch(function (err) {
        console.log(err);
        res.send(err);
    }) 
}

function add(req,res) {
   
}

function getAll(req, res) {
    console.log('Devolviendo todos los Libros');
    //Devuelve todos los libros, con una lista de sus generos y autores
    session
    .run('MATCH (g:GENRE)-[]-(b:BOOK)-[]-(w:WRITER) RETURN collect(g.genre) AS genres ,b, collect(DISTINCT w.name) AS writers ')
    .then( function (result) {
        var libros = [];        
        result.records.forEach(function (record) {
            libros.push({
                id: record.get('b').identity.low,
                title: record.get('b').properties.title,
                pages: record.get('b').properties.pages,
                rating: record.get('b').properties.rating.low,
                rating_count: record.get('b').properties.rating_count.low,
                writers: record.get('writers'),
                genres: record.get('genres')   
            })         
        })
        console.log
        res.json(libros);
        
    })
    .catch(function(err) {
        console.log(err);
    })
}
function getOne(req, res) {
    console.log('Devolviendo un libro');
    //Devuelve el libro especificado con una lista de sus generos y autores
    session
    .run('MATCH (g:GENRE)-[]-(b:BOOK)-[]-(w:WRITER) WHERE id(b)=$id RETURN collect(g.genre) AS genres ,b, collect(DISTINCT w.name) AS writers ', {
        id:neo4j.int(req.params.id)
    })
    .then( function (result) {
        var libros = [];        
        result.records.forEach(function (record) {
            libros.push({
                id: record.get('b').identity.low,
                title: record.get('b').properties.title,
                pages: record.get('b').properties.pages,
                rating: record.get('b').properties.rating.low,
                rating_count: record.get('b').properties.rating_count.low,
                writers: record.get('writers'),
                genres: record.get('genres')   
            })         
        })
        console.log
        res.json(libros);
        
    })
    .catch(function(err) {
        console.log(err);
    })
}




module.exports = {
    getAll,getOne, add, remove
}