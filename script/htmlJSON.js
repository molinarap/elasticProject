// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

// torna un array di file in /storage/html/[data]/[nome]/
var getListFileHtml = new Promise(function(resolve, reject) {
    var path = './../storage/' + d + '/html/';
    // leggo tutte le cartelle in /storage/html/[data]/
    fs.readdir(path, function(err, items1) {
        for (var i = 0; i < items1.length; i++) {
            //per ogni cartella in /storage/html/[data]/
            var filePath = path + items1[i] + '/';
            var allHtml = {
                'name': items1[i],
                'path': filePath
            };
            // leggo tutte le cartelle in /storage/html/[data]/[nome]/
            fs.readdir(filePath, function(err, items2) {
                allHtml.items = items2;
                resolve(allHtml);
            });
        }
    });
});

var readFileHtml = function(filePath, fileHtml) {
    return new Promise(function(resolve, reject) {
        //per ogni file in /storage/html/[data]/[nome]/
        var htmlPath = filePath;
        // leggo leggo il file i in /storage/html/[data]/[nome]/
        resolve(fs.readFileSync(htmlPath).toString().split('\n'));
    });
};

var createJsonHtml = function(listHtml) {
    return new Promise(function(resolve, reject) {
        var all = {
            'site': []
        };
        for (var i = 0; i < listHtml.items.length; i++) {
            var allHtml = {};
            var filePath = listHtml.path + listHtml.items[i];
            all.path = filePath;
            all.name = listHtml.name;
            readFileHtml(filePath, listHtml.items[i])
                .then(function(results) {
                    //allHtml.content.push(results);
                    var htmlString = '';
                    for (var j = 0; j < results.length; j++) {
                        if (results[j + 1] !== undefined) {
                            htmlString = htmlString + results[j] + results[j + 1];
                        } else {
                            htmlString = htmlString + results[j];
                        }
                    }
                    allHtml.content = htmlString;
                    all.site.push(allHtml);
                    //console.log('allHtml: ', allHtml);
                });

        }
        resolve(all);
    });
};


// scrive il JSON su disco
var writeFileJsonHtml = function(jsonHTML) {
    var dir = './../storage/' + d + '/url-html/';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    var file = './../storage/' + d + '/url-html/' + jsonHTML.name + '.json';
    jsonfile.writeFile(file, jsonHTML, function(err) {
        if (err) {
            console.error('ERROR: ', err);
        }
    })

}

var all = function() {
    getListFileHtml
        .then(function(results) {
            //console.log('results: ', results);
            return createJsonHtml(results);
            // writeFileJsonHtml(results);
        }).then(function(results2) {
            writeFileJsonHtml(results2)
                //console.log('results2: ', results2);
        });
};

all();
