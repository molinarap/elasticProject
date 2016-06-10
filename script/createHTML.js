var jsonfile = require('jsonfile');
var request = require("request");
var util = require('util');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var path = './../storage/' + d + '/url/';

var download = function(name, web, i) {
    if (i === 0) {
        var result_dir = './../storage/' + d + '/html/' + name;
        if (!fs.existsSync(result_dir)) {
            fs.mkdirSync(result_dir);
        }
    }
    request({
        uri: web.url,
    }, function(error, response, body) {
        var commentName = '<!--NAME' + name + 'NAME-->\n';
        var commentTitle = '<!--TITLE' + web.title + 'TITLE-->\n';
        var commentDescription = '<!--DESCR' + web.description + 'DESCR-->\n';
        var commentUrl = '<!--URL' + web.url + 'URL-->\n<!--HTML-->\n';
        var allInfo = commentName + commentTitle + commentDescription + commentUrl;
        fs.writeFile('./../storage/' + d + '/html/' + name + '/' + name + '_page' + i + '.html', allInfo + body, function(err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("The file " + i + " was saved!");
            }
        });
    });
};

var readAllFiles = new Promise(
    function(resolve, reject) {
        fs.readdir(path, function(err, items) {
            if (err) {
                reject(err);
            } else {
                resolve(items);
            }
        });
    });

var getFileUrl = function(items) {
    return new Promise(
        function(resolve, reject) {
            var allLink = [];
            // for (var i = 0; i < items.length; i++) {
            for (var i = 0; i < 1; i++) {
                // salto i file nascosti
                if (items[i].substring(0, 1) !== '.') {
                    var filePath = path + items[i];
                    // mmmmmm si interrompe il ciclo for
                    // quando entra in questa funzione
                    jsonfile.readFile(filePath, function(err, obj) {
                        if (err) {
                            reject(err);
                        } else {
                            allLink.push(obj);
                            // if (i === items.length) {
                            if (i === 1) {
                                resolve(allLink);
                            }
                        }
                    });
                }
            }
        });
};


var createFileHTML = function() {
    readAllFiles
        .then(function(result) {
            console.dir('n° items trovati -----> ' + result.length);
            return getFileUrl(result);
        }, function(error) {
            console.log('ERROR -----------> ', error);
        })
        .then(function(result1) {
            //console.dir(result1[0]);
            var name = result1[0].name;
            var web = result1[0].web;
            for (var i = 0; i < web.length - 1; i++) {
                download(name, web[i], i);
            }
            return console.log('FINITOOOOOOOOO');
        }, function(error1) {
            console.log('ERROR -----------> ', error);
        });
};

createFileHTML();
