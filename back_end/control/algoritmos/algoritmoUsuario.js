/*
* Algoritmo que devuelve una lista con los libros recomendados para el usuario especificado
*/
const utils = require ('./utils');
const userControl = require('../userControl');
const { containsID } = require('./utils');

const min_correlation = 0//Nota minima para ingresar en la comunidad
const max_users = 10 //maximo de usuarios de la comunidad
const max_books = 3 //numero de libros que devuelve la recomendación

function pruebas () {
    console.log("Pruebas")
    //Rellenamos el array de 0
    var a = utils.createArray(5)
    a[2]=2
    console.log(a)
}

/*
* PARAMS
* id => id del usuario
*/
async function recommend (id) {
    console.log('Recomendando libros para el usuario '+id);
    //var users = await getAllUsers()
    //console.log (users)
    var user_books = await utils.getUserBooks(id);
    //console.log(user_books)
    try {
        var neighbors = []
        neighbors = await utils.getUserNeighbors(id);

        if (neighbors.length != 0) {
            //Tiene vecinos => Buscamos su comunidad
            //console.log('Creamos la comunidad del usuario')
            var community = await getUserCommunity(user_books,neighbors);       
            console.log("Comunidad: "+ neighbors.length);
            console.log(neighbors)    
            if (community.length>0) {           
                //Creamos la lista de libros que se van a recomendar al usuario              
                recomended_books = getRecomendedBooks (neighbors, user_books)             
                console.log("Libros recomendados para el usuario:")
                //Una vez tenemos la lista de libros que se van a recomendar, realizamos la recomendación por filtrado colaborativo
                var topLibros = fitradoColaborativo(user_books, recomended_books, neighbors)
                console.log("TOP")
                console.log(topLibros)
               
            } else {
                console.log('El usuario no pertenece a ninguna comunidad => no se puede recomendar')
                return 0
            }
            return topLibros;
            
        } else {
            return 0; //NO tiene vecinos válidos => No puede recomendar
        }
        
    } catch (e) {
        console.log('Exception '+ e);
        return 'Error';
    }

}
function fitradoColaborativo (user_books, recomended_books, neighbors) {
    console.log("Libros del usuario: ")
    console.log(user_books)
    console.log("Libros a recomendar: ")
    console.log(recomended_books)
    //Calculamos la diferencia media entre las notas otorgadas a cada libro del usuario y libro a recomendar   
    for (var rb of recomended_books) {
        var prediction=0 // Sumatorio (Coef)
        var total =0 //Numero total de usuarios que participaron en la recomendación (incluida repeticiones)
        for (var ub of user_books) {
            //console.log("Libro: " + ub.titulo)
            var n = 0 //numero de usuarios que han participado en la recomendaciónv
            var media = 0
            for (i=1;i<ub.nota.length;i++) { //Empezamos en 1 ya que el 0 es la nota que va a dar el usuario
                if (ub.nota[i] != 0 && rb.nota[i]!=0) { //Si ha puntuado los 2 libros, se realiza la recomendación
                    n++; 
                    console.log("Libro : " + rb.titulo + " vs " + ub.titulo + " => " + rb.nota[i] + " - " + ub.nota[i] + " * " +  neighbors[i-1].correlation)                            
                    media+= (rb.nota[i] - ub.nota[i]) * neighbors[i-1].correlation //Multiplicamos por el coeficiente de correlación 
                }
            }  
            if (n!=0) {
                media = media / n
                //console.log("Media comparación " + rb.titulo + " y " + ub.titulo + " = " +media )
                prediction += (ub.nota[0]+media) * n
                total+=n
            } else {
                //No hace nada
                //console.log("Media comparación " + rb.titulo + " y " + ub.titulo + " = NO PROCEDE")
            }
                    
        }
        if (total != 0 ) {
            prediction = prediction/total
            rb.nota[0] = prediction
            //console.log("Recomendación terminada")
            //console.log(rb)
        } else {
            console.log("No se puede recomendar este libro recomendación")
        }       
    }
    console.log("Predicción terminada")
    console.log(recomended_books)
    return getTopBooks(recomended_books, max_books)
    
}
//Devuelve un top con las notas del usuario más altas
function getTopBooks (books, max_books) {
    console.log("Creando top de libros")
    var top = [] 
    for (var i=0;i<books.length;i++) {
        //console.log(books[i])
        if (i<max_books) {
            top.push(books[i])
        } else {
            min = getMinBook(top)
            if (top[min].nota[0] < books[i].nota[0]) {
                top[min] = books[i]
            }
        }
    }
    //console.log(top)
    return top
}
//Devuelve la poscición del libro con la nota de usuario más baja
function getMinBook (books) {
    var out = 0 //Posición del libro con la nota más baja
    var minGrade = 0
    for (i=0;i<books.length;i++) {
        var grade = books[i].nota[0] 
        if (i==0) {
            minGrade = grade
        } else {
            if (grade < minGrade) {
                minGrade = grade
                out = i
            }
        }
    }
    return out
}

function getRecomendedBooks(neighbors, user_books) {
    for (var b of user_books) {
        notas = utils.createArray(neighbors.length+1)
        notas[0] = b.nota
        b.nota = notas;
    }
    var recomended_books = [] //Array de libros a recomendar
    var i=1 //Empieza en 1 ya que la posición 0 será la reservada para el usuario
    for (var u of neighbors) {
        for (var b of u.books) {
            var pos = containsID(user_books, b.id) //Posición del libro en el array de libros del usuario (-1 => No está)
            if (pos!= (-1)) {      //El libro ha sido leido por el usuario => añadimos la nota    
                user_books[pos].nota[i] = b.nota //Añadimos la nota del usuario al libro
            } else {    //El libro no ha sido leido por el usuario, miramos si hay que añadirlo a la lista o ya está
                pos = containsID(recomended_books,b.id)                      
                if (pos!=(-1)) { //El libro Si está en la lista 
                    recomended_books[pos].nota[i] = b.nota //Añadimos la nota
                } else { //El libro NO está en la lista => lo añadimos
                    nota = utils.createArray(neighbors.length+1) //Creamos un array de notas que contendrá todas las notas de los miembros de la comunidad + el usuario
                    nota[i] = b.nota 
                    recomended_books.push({
                        id:b.id,
                        titulo: b.titulo,
                        nota: nota
                    })
                }                
            }
        }
        i++;
    }
    return recomended_books
}

async function getUserCommunity (user_books, neighbors) { 
    //Por cada usuario de neighbors, obtenemos todos sus libros y su correlación con el solicitante
    for (var user of neighbors) {
        try {
        var books = await utils.getUserBooks(user.id)
        user.books=books
        //Una vez tenemos los libros de ese usuario calculamos la correlación con el solicitante
        user.correlation = await getCorrelation(user_books, user.books) 
        //console.log (user);     
        } catch (e) {
            console.log (e)
        }
    }
    //Recogemos solo los x con mayor correlación
    var community = getBestMatch (neighbors, max_users, min_correlation)
    /*
    console.log ("Comunidad del usuario " + id )
    for (i=0;i<community.length;i++) {
        console.log(community[i])
    }
    */
    return community
}

function getBestMatch (users, max_users, min_correlation) {
    var count = 0;
    var best = [];
    for (var user of users) {
        if (count < max_users) {
            if (user.correlation > min_correlation) {
                best.push(user)
                count++;
            }
        } else {
            for (var u of best) {
                var lowestPos=0 //Posición del usuario con la correlación más baja
                var lowestCor=0;
                if (lowestCor = 0 || u.correlation<lowestCor) {
                    lowestCor = u.correlation
                    lowestPos = best.indexOf(u)
                }
            }
            if (user.correlation>lowestCor) {
                best [lowestPos] = user
            }
        }
    }
    return best
}
/*
* Dadas dos litas de  libros, calcula la correlación entre ambas siguiendo el siguiente patrón
* Si el libro tiene la misma puntuación en las 2 listas => +1
* Si el libro tiene +-1 en las listas => +0.5
* Si el libro aparece en ambas => +0.25
* Correlación => SUMA / TOTAL libros
*/
function getCorrelation (books_1, books_2) {
    /*
    console.log("------------------------- Lista 1 --------------------------")
    console.log(books_1)
    console.log("------------------------- Lista 2 --------------------------")
    console.log(books_2)
    */
    var correlation = 0
    for (var book1 of books_1) {
        for (var book2 of books_2) {
            if (book1.titulo == book2.titulo) {
                //console.log("¡Mismo libro!")
                if (book1.nota == book2.nota) {
                    correlation+=1
                } else if ((book1.nota+1) == book2.nota || (book1.nota-1) == book2.nota ) {
                    correlation +=0.5
                } else {
                    correlation +=0.25
                }
            }
        }
    }
    //console.log("Correlacion = " + correlation + " / " + books_1.length) 
    correlation = correlation / books_1.length
    //console.log("Correlación = " + correlation)
    return correlation
}
module.exports = { recommend, pruebas }