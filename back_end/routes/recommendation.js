var express = require ('express')

//Controlador
var control = require('../control/recommendationControl')
//Router
var app = express.Router()
//Rutas 
app.get('/recommend/user/:id', function (req,res) {
    console.log('Iniciando recomendación basada en usuario...')
    control.recommendUser(req,res);      
})

app.get('/recommend/book/:id', function (req,res) {
    //Devuelve todos los libros
    console.log('Iniciando recomendación basada en libro...')
    //control.recommendUser(req,res);      
})

module.exports = app

