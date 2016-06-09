var jsonfile = require('jsonfile');
var request = require("request");
var util = require('util');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();


// Utility function that downloads a URL and invokes
// callback with the data.
// var download = function(name, url, i) {
//     if (i === 0) {
//         var result_dir = './../storage/' + d + '/html/' + name;
//         if (!fs.existsSync(result_dir)) {
//             fs.mkdirSync(result_dir);
//         }
//     }
//     request({
//         uri: url,
//     }, function(error, response, body) {
//         fs.writeFile('./../storage/' + d + '/html/' + name + '/' + name + '_page' + i + '.html', body, function(err) {
//             if (err) {
//                 return console.log(err);
//             } else {
//                 console.log("The file " + i + " was saved!");
//             }
//         });
//     });
// };

var readAllFiles = new Promise(
    function(resolve, reject) {
        var path = './../storage/' + d + '/url/';
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
            var path = './../storage/' + d + '/url/';
            for (var i = 0; i < items.length; i++) {
                if (items[i].substring(0, 1) !== '.') {
                    var filePath = path + items[i];
                    // mmmmmm si interrompe il ciclo for
                    // quando entra in questa funzione
                    jsonfile.readFile(filePath, function(err, obj) {
                        if (err) {
                            reject(err);
                        } else {
                            allLink.push(obj);
                            if (i === items.length) {
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
            console.dir(result1);
        }, function(error1) {
            console.log('ERROR -----------> ', error);
        });

    // getFileUrl
    //     .then(function(result) {
    //         console.log('result', result.name);
    //         var name = result.name;
    //         var web = result.web;
    //         for (var i = 0; i < web.length; i++) {
    //             download(name, web[i].url, i);
    //         }
    //     }, function(error) {
    //         console.log('ERROR -----------> ', error);
    //     });
};

createFileHTML();
