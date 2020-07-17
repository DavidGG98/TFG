var session = require('../config/database')
var neo4j = require('neo4j-driver')

const a_user = require ('./algoritmos/algoritmoUsuario')
const a_product = require ('./algoritmos/algoritmoProducto')

async function recommendUser (req,res) {
    //Chequear que el usuario existe
    try {
        id = req.params.id
        //a_user.pruebas();
        var out="nada";
        out = await a_user.recommend(req.params.id) //Esperamos a que se realice el proceso de recomendación
        console.log('Output: '+out)    
        res.send(out);
    } catch (e) {
        console.log('Se ha producido una excepcion ' + e)
        res.send('Error')
    }
}

function checkExistence (id) {
    //Chequeamos que existe el usuario
}




module.exports = { recommendUser }