var express = require ('express')

//Controlador
var control = require('../control/recommendationControl')
//Router
var app = express.Router()
//Rutas 
app.get('/recommend/user/:id', function (req,res) {
    //Devuelve todos los libros
    console.log('Iniciando recomendación...')
    control.recommendUser(req,res);      
})

module.exports = app

