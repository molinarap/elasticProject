// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();
var path = './../storage/' + d + '/html/';

// torna un array di file in /storage/[data]/html/[nome]/
var getListFileHtml = function() {
    return new Promise(function(resolve, reject) {
        // leggo tutte le cartelle in /storage/[data]/html/
        fs.readdir(path, function(err, items1) {
            if (err) {
                reject(err);
            } else {
                for (var i = 0; i < items1.length; i++) {
                    //per ogni cartella in /storage/[data]/html/
                    var filePath = path + items1[i] + '/';
                    var allHtml = {
                        'name': items1[i],
                        'path': filePath
                    };
                    // leggo tutte le cartelle in /storage/[data]/html/[nome]/
                    fs.readdir(filePath, function(err, items2) {
                        allHtml.items = items2;
                        resolve(allHtml);
                    });
                }
            }
        });
    });
};

var readFileHtml = function(filePath) {
    return new Promise(function(resolve, reject) {
        //per ogni file in /storage/html/[data]/[nome]/
        var htmlPath = filePath;
        // leggo leggo il file i in /storage/html/[data]/[nome]/
        resolve(fs.readFileSync(htmlPath).toString().split('\n'));
    });
};

var concatString = function(array) {
    return new Promise(function(resolve, reject) {
        var htmlString = '';
        for (var j = array.length - 1; j >= 0; j--) {
            htmlString = htmlString + array[j];
            if (j === 0) {
                resolve(htmlString);
            }
        }
    });
};

// <!--NAMEAbbate VincenzoNAME-->
// <!--TITLEABBATE GIOVANNI VINCENZO - Grazzanise (CE)TITLE-->
// <!--DESCRABBATE GIOVANNI VINCENZO - Scheda aziendale su Annunci Caserta.DESCR-->
// <!--URLhttp://www.annuncicaserta.it/azienda.asp?a=456146URL-->
var extractInfo = function(s) {
    var a = s.split('<!--HTML-->');
    var allInfo = a[1];
    var nameTemp = allInfo.split('NAME');
    var titleTemp = allInfo.split('TITLE');
    var descrTemp = allInfo.split('DESCR');
    var urlTemp = allInfo.split('URL');
    var o = {
        "name": nameTemp[1],
        "title": titleTemp[1],
        "descr": descrTemp[1],
        "url": urlTemp[1]
    };
    return o;
};

var createJsonHtml = function(pathPage, items, a, i) {
    var allHtml = {};
    var filePath = pathPage + items[i];
    readFileHtml(filePath)
        .then(function(results) {
            concatString(results)
                .then(function(r) {
                    allHtml = extractInfo(r);
                    allHtml.content = r;
                    a.allPages.push(allHtml);
                    if (i === 0) {
                        writeFileJsonHtml(a);
                    } else {
                        createJsonHtml(pathPage, items, a, i - 1);
                    }
                });
        }, function(err) {
            console.log('err ------------>', err);
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
    });
};

getListFileHtml()
    .then(function(results) {
        var all = {
            'name': results.name,
            'allPages': []
        };
        createJsonHtml(results.path, results.items, all, results.items.length - 1);
    });
