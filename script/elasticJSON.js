// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();
var path = './../storage/' + d + '/url-html/';
var elasticPath = './../storage/' + d + '/elastic/elastic_' + d + '.json';

// torna un array di file in /storage/[data]/html/[nome]/
var getListFileJson = function(listHtml) {
    return new Promise(function(resolve, reject) {
        // leggo tutte le cartelle in /storage/[data]/html/
        fs.readdir(path, function(err, items1) {
            for (var i = 0; i < items1.length; i++) {
                //per ogni cartella in /storage/[data]/html/
                var filePath = path + items1[i];
                resolve(filePath);
            }
        });
    });
};

var readFileHtml = function(filePath) {
    return new Promise(function(resolve, reject) {
        // leggo il file i in /storage/[data]/html/[nome]/
        jsonfile.readFile(filePath, function(err, obj) {
            resolve(obj);
        });
    });
};

var p = {
    "name": "Abbate Vincenzo",
    "allPages": [{
        "content": "sito",
    }]
};

var createElasticJson = function(filePath) {
    return new Promise(function(resolve, reject) {
        // console.log("filePath", filePath);
        for (var i = 0; i < 1; i++) {
            readFileHtml(filePath)
                .then(function(results) {
                    var doc = '';
                    console.log('results.allPages.length ------>' + results.allPages.length);
                    for (var j = results.allPages.length - 1; j >= 0; j--) {
                        var index = '{ "index": { "_id": "' + j + '" } }\n';
                        var site = JSON.stringify(results.allPages[j]);
                        //console.log(site.substring(0, 300));
                        //console.log('j ------>' + j);
                        var allLine = index + site + '\n';
                        doc = doc + allLine;
                        if (j === 0) {
                            console.log('POSSIAMO SCRIVERE ORA!');
                            fs.open(elasticPath, 'a', 666, function(e, id) {
                                fs.write(id, doc, 'utf8', function() {
                                    fs.close(id, function() {
                                        console.log('file is updated');
                                    });
                                });
                            });

                        }
                    }
                });
        }
        resolve(allHtml);
    });
};


// scrive il JSON su disco
var writeFileJsonHtml = function() {
    fs.writeFile(elasticPath, '', function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

};

Promise
    .all([writeFileJsonHtml(), getListFileJson()])
    .then(function(value) {
        console.log('value[1]', value[1]);
        return createElasticJson(value[1]);
    });
