var express = require ('express')
var app = express ()

//Importamos rutas
var userRoute = require('./routes/user') 
var bookRoute = require('./routes/book')
var recommendRoute = require('./routes/recommendation')
//Cargamos rutas
app.use('/data',userRoute)
app.use('/data',bookRoute)
app.use('/data', recommendRoute)

app.get('/', function (req, res) {
    console.log('Petición a / recibida');
    //Devolver guia API
    res.send('Trabajo fin de grado David Gonzalez Garcia 2020');    
})

app.listen(3000, function() {
    console.log('Aplicación escuchando en el puerto 3000')
});

module.exports = app;