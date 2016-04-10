var jsonfile = require('jsonfile')
var request = require("request");
var util = require('util')
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var createFolder = function(path) {
    if (fs.existsSync(path)) {
        deleteFolderRecursive(path);
        console.log('--------------------------------------------');
    }
    console.log('create directory ---> ', parent_dir);
    fs.mkdirSync(parent_dir);
    createOtherDir();
};

// Utility function that downloads a URL and invokes
// callback with the data.
var download = function(name, url, i) {
    if (i === 0) {
        var result_dir = './../storage/' + d + '/html/' + name;
        if (!fs.existsSync(result_dir)) {
            fs.mkdirSync(result_dir);
        }
    }
    request({
        uri: url,
    }, function(error, response, body) {
        fs.writeFile('./../storage/' + d + '/html/' + name + '/' + name + '_page' + i + '.html', body, function(err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("The file " + i + " was saved!");
            }
        });
    });
};

var createFileHTML = function() {
    var getFileUrl = new Promise(
        function(resolve, reject) {
            var path = './../storage/' + d + '/url/';
            fs.readdir(path, function(err, items) {
                console.log('items - ', items);
                for (var i = 0; i < items.length; i++) {
                    // console.log('items - ', items[i]);
                    var filePath = path + items[i];
                    jsonfile.readFile(filePath, function(err, obj) {
                        var urlObj = obj;
                        // console.dir('urlObj - ', urlObj);
                        resolve(urlObj);
                    });
                }
            });
        }
    );

    getFileUrl.then(
            function(result) {
                //console.log(result);
                var name = result.name;
                var web = result.web;
                for (var i = 0; i < web.length; i++) {
                    download(name, web[i].url, i);
                }
            })
        .catch(
            function(reason) {
                console.log('Handle rejected promise (' + reason + ') here.');
            });
};

createFileHTML();
