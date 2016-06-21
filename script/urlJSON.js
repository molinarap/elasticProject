// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco
// dato un JSON di nomi tramite le API di Bing vengono
// estretti tutti gli url riferiti a quel nome trovati
// da Bing
var Bing = require('node-bing-api')({ accKey: "L45X7080j4f+ZNhEuGnEz9xDBQtI8X3fdRdMfyjViD0" });
var jsonfile = require('jsonfile');
var fs = require('fs');
var Promise = require("bluebird");

var d = new Date();
d = d.toLocaleDateString();

var input = process.env.INPUT;

if (!input) {
    input = './../storage/pizza_men.json';
}

// leggo file json e lo salvo in una variabile
// quindi ho un json con tutti i nomi
var getFilePizza = function() {
    return new Promise(function(resolve, reject) {
        console.log('FILE CARICATO ------>  ' + input);
        var file = input;
        jsonfile.readFile(file, function(err, obj) {
            if (err) {
                reject(err);
            } else {
                resolve(obj);
            }
        });
    });
};

// scrive un file json con contenuto l'oggetto passato alla funzione
var writeFileUrl = function(info) {
    var file = './../storage/' + d + '/url/' + info.name + '.json';
    jsonfile.writeFile(file, info, function(err) {
        if (err) {
            console.error('ERROR: ', err);
        } else {
            console.log('Il file è stato creato');
        }
    });
};


// dato un nome esegue una ricerca tramite le API Bing
// e ritorna un oggetto con tutti gli url ritornati dalla ricerca
// che scrive tramite un altre funzione su dei file json
var getBingUrl = function(word, n, s) {
    console.log('RICERCA --------------> ', word);
    Bing.web(word, {
        top: 10, // Skip first 3 results
        skip: 50 * s, // Skip first 3 results
        options: ['DisableLocationDetection', 'EnableHighlighting']
    }, function(error, res, body) {
        if (error) {
            console.error('API BING ERROR --->', error);
        } else {
            for (var i = body.d.results.length - 1; i >= 0; i--) {
                var obj = body.d.results[i];
                var web = {
                    'title': obj.Title,
                    'description': obj.Description,
                    'url': obj.Url
                };
                n.web.push(web);
                if (i === 0) {
                    if (s !== 0) {
                        getBingUrl(word, n, s - 1);
                    } else {
                        console.log('FINE RICERCA --------------> ', n.name);
                        writeFileUrl(n);
                    }
                }
            }

        }
    });
};

getFilePizza()
    .then(function(array) {
            var list = array.names;
            Promise.each(list, function(element, index) {
                    console.log('AVVIO RICERCA...' + index);
                    var n = {
                        'name': element,
                        'web': []
                    };
                    // per averne circa 600 va messo 6
                    getBingUrl(element, n, 0);
                })
                .then(function(allItems) {
                    console.dir(allItems);
                });
        },
        function(error) {
            console.log('INSERISCI IL PATH DEL FILE INPUT (json)');
        });



// getFilePizza()
//     .then(function(array) {
//             console.log('AVVIO RICERCA...');
//             var list = array.names;
//             // for (var i = 0; i < list.length; i++) {
//             for (var i = 0; i < 1; i++) {
//                 var n = {
//                     'name': list[i],
//                     'web': []
//                 };
//                 // per averne circa 300 va messo 6
//                 getBingUrl(list[i], n, 1);
//             }
//         },
//         function(error) {
//             console.log('INSERISCI IL PATH DEL FILE INPUT (json)');
//         });
