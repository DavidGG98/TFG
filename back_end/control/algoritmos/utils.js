var session = require('../../config/database')
var neo4j = require('neo4j-driver')


function containsID (array,id) {
    //console.log("comprobando que existe")
    //console.log(array);
    for(i=0;i<array.length;i++) {
        //console.log(array[i].id + ' vs ' + id)
        if (array[i].id==id) {
            return i
        }
    }
    return -1
}


async function getUser (id) {
    //console.log('Devolviendo usuario')
    var user = []
    await session
    .run('MATCH(n:READER) WHERE id(n) = $id RETURN n', {
        id:neo4j.int(req.params.id)
    })
    .then(function (result) {
        console.log(result)
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
    return user;
}

async function getAllUsers () {
    //console.log('TODOS LOS USUARIOS')
    var user = [];
    await session
    .run('MATCH (n:READER) RETURN n')
    .then( function (result) {
        result.records.forEach(function (record) {
            user.push({
                id: record.get('n').identity.low,
                name: record.get('n').properties.name
            })           
        })
        //console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    })
    //console.log(user);
    return user;
}
async function getUserBooks (id) {

    var libros = []
    await session
    .run('MATCH (n:READER)-[r:READ]->(b:BOOK) WHERE id(n)=$id RETURN b,r', {
        id: neo4j.int(id)
    })
    .then(function (result) {    
        result.records.forEach(function (record) {
            //notas = []
            //notas.push()
            libros.push({
                id: record.get('b').identity.low,
                titulo: record.get('b').properties.title,
                nota: record.get('r').properties.grade.low
            })
        })
        //console.log(libros)
    })
    .catch(function (err) {
        console.log('Ha ocurrido una excepcion')
        console.log(err);
    })
    return libros;
}

async function getUserNeighbors (id) {
    //console.log('Obteniendo los vecinos del usuario ' + id)
    var users = []
    //Obtenemos los usuarios vecinos que tengan al menos un libro en común con una nota +-1 a la nota asignada por el usuario
    await session.run('MATCH (n:READER)-[r]-(b)-[r2]-(m:READER) '
    + ' WHERE id(n) = $id AND (r2.grade= r.grade+1 OR r2.grade=r.grade OR r2.grade= r.grade-1) '
    + ' RETURN DISTINCT m LIMIT 2', { id: neo4j.int(id)})
    .then(result => {
        result.records.forEach(record => {
            users.push ({
                id: record.get('m').identity.low,
                nombre: record.get('m').properties.name
            })
        })
        //console.log('Operiación exitosa');
    })
    .catch(error => {
        console.log("Exception");
        console.log(error)
    })
    //console.log('Total vecinos: ' + users.length)
    //console.log(users)
    return users;
}

async function hasRead (user, book)  {
    var grade=0;
    await session.run ('MATCH (n:READER)-[r]->(b:BOOK) WHERE id(n)=$user AND id(b)=$book RETURN r', {
        user: neo4j.int(user),
        book: neo4j.int(book)
    }).then(result => {
        result.records.forEach(record => {
            grade = record.get('r').properties.grade
            //console.log('El usuario ha leido el libro con una nota de '+grade)
        })
    }).catch(err => {
        console.log(err)
        grade=0
    })
    return grade
}

function createArray (size) {
    out = new Array (size) 
    for (i=0;i<out.length;i++) {
        out[i]=0
    }
    return out
}

module.exports = { getAllUsers, getUserBooks, getUserNeighbors, hasRead, getUser, containsID, createArray}