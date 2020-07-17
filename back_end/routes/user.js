var express = require ('express')
var bp = require ('body-parser')
var cors = require ('cors')
//Controlador
var control = require('../control/userControl')
//Router
var app = express.Router()
app.use(bp.urlencoded({ extended: true}))
app.use(bp.json())
app.use(cors())
//Rutas 
app.get('/user', function (req,res) {
    //Devuelve todos los usuarios
    console.log('Peticion GET a /user')
    control.getAll(req,res);      
})
app.get('/user/:id', function (req, res) {
    //Devuelve el usuario con el ID especificado
    console.log('Peticion GET a /user/:id')
    control.getOne(req,res);
})
app.post('/user', function (req,res) {
    //Crea o actualiza un nuevo usuario
    console.log('Peticion POST a /user ')
    control.add(req,res)
})
//Devuelve libros usuario
app.get('/user/:id/read', function(req,res) {
    console.log('Petición GET a /read')
    control.getBooks(req,res)
}) 
//Elimina usuario
app.delete('/user', function (req,res) {
    console.log('Peticion DELETE /user')
    control.remove(req,res)
})
//Autentificación del usuario
app.post('/authenticate', function(req, res){
    console.log('POST /authentificate')
    control.authenticate(req,res)
})
module.exports = app

