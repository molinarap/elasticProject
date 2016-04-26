// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco
// dato un JSON di nomi tramite le API di Bing vengono
// estretti tutti gli url riferiti a quel nome trovati
// da Bing
var Bing = require('node-bing-api')({ accKey: "L45X7080j4f+ZNhEuGnEz9xDBQtI8X3fdRdMfyjViD0" });
var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

// leggo file json e lo salvo in una variabile
// quindi ho un json con tutti i nomi
var getFilePizza = new Promise(function(resolve, reject) {
    var file = './../storage/pizza_men.json';
    jsonfile.readFile(file, function(err, obj) {
        if (err) {
            reject(err);
        } else {
            resolve(obj);
        }
    });
});

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
var getBingUrl = function(word) {
    console.log('INZIO RICERCA --------------> ', word);
    Bing.web(word, {
        skip: 5, // Skip first 3 results
        options: ['DisableLocationDetection', 'EnableHighlighting']
    }, function(error, res, body) {
        if (error) {
            console.error('API BING ERROR --->', error);
        } else {
            var url = {
                'name': word,
                'web': []
            };
            //for (var i = 0; i < body.d.results.length; i++) {
            for (var i = 0; i < body.d.results.length; i++) {
                var obj = body.d.results[i];
                var web = {
                    'title': obj.Title,
                    'description': obj.Description,
                    'url': obj.Url
                };
                url.web.push(web);
                writeFileUrl(url);
            }
            console.log('FINE RICERCA --------------> ', url.name);
        }
    });
};


var all = function() {
    getFilePizza
        .then(function(array) {
                console.log('Array pronto per essere usato');
                var a = array.pizza_men;
                for (var i = 0; i < a.length; i++) {
                    getBingUrl(a[i]);
                }
            },
            function(error) {
                console.error('Non sono riuscito ad estrarre l\'array');
            });

};

all();
