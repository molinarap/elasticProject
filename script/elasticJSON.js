// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var path = './../storage/elastic/';
if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
} else {
    var deleteFolderRecursive = function(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
}

// torna un array di file in /storage/html/[data]/[nome]/
var getListFileJson = new Promise(function(resolve, reject) {
    var path = './../storage/url-html/' + d + '/';
    // leggo tutte le cartelle in /storage/html/[data]/
    fs.readdir(path, function(err, items1) {
        for (var i = 0; i < items1.length; i++) {
            //per ogni cartella in /storage/html/[data]/
            var filePath = path + items1[i] + '/';
            // leggo tutte le cartelle in /storage/html/[data]/[nome]/
            var allHtml = {
                'path': './../storage/url-html/' + d + '/',
                'items': items1
            };
            resolve(allHtml);
        }
    });
});

var readFileHtml = function(filePath, fileHtml) {
    return new Promise(function(resolve, reject) {
        //per ogni file in /storage/html/[data]/[nome]/
        var htmlPath = filePath;
        // leggo leggo il file i in /storage/html/[data]/[nome]/
        jsonfile.readFile(htmlPath, function(err, obj) {
            resolve(obj);
        });
    });
};

var createElasticJson = function(listHtml) {
    return new Promise(function(resolve, reject) {
        for (var i = 0; i < 1; i++) {
            var filePath = listHtml.path + listHtml.items[i];
            readFileHtml(filePath, listHtml.items[i])
                .then(function(results) {
                    var doc = '';
                    for (var j = 0; j < results.site.length; j++) {
                        var index = '{ "index": { "_id": "' + j + '" } }\n';
                        var site = JSON.stringify(results.site[i]);
                        var allLine = index + site + '\n';
                        doc = doc + allLine;
                    }
                    fs.open('./../storage/elastic/2016-04-10/prova.json', 'a', 666, function(e, id) {
                        fs.write(id, doc, 'utf8', function() {
                            fs.close(id, function() {
                                console.log('file is updated');
                            });
                        });
                    });
                });
        }
        resolve(allHtml);
    });
};


// scrive il JSON su disco
var writeFileJsonHtml = function(jsonHTML) {
    var dir = './../storage/elastic/' + d;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);

        var version = new Date();

        var file = dir + '/prova.json';

        fs.writeFile(file, '', function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

}

var all = function() {
    writeFileJsonHtml();
    getListFileJson
        .then(function(results) {
            //console.log('results: ', results);
            return createElasticJson(results);
        }).then(function(results2) {
            console.log('results2: ', results2);
        });
};

all();
