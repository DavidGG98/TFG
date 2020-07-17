var express = require ('express')

//Controlador
var control = require('../control/bookControl')
//Router
var app = express.Router()
//Rutas 
app.get('/book', function (req,res) {
    //Devuelve todos los libros
    console.log('Peticion GET a /books')
    control.getAll(req,res);      
})
app.get('/book/:id', function (req, res) {
    //Devuelve el libro con el ID especificado
    console.log('Peticion GET a /user/:id')
    control.getOne(req,res);
})
app.post('/book', function (req,res) {
    //Crea un nuevo libro
    console.log('Peticion POST a /user ')
    control.add(req,res)
})
//Devuelve libros usuario
//Elimina usuario
//Autentificación del usuario
module.exports = app

