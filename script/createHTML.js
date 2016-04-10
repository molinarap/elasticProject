var jsonfile = require('jsonfile')
var request = require("request");
var util = require('util')
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var path = './../storage/html/';
if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
} else {
    var deleteFolderRecursive = function(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
}

// Utility function that downloads a URL and invokes
// callback with the data.
var download = function(name, url, i) {
    if (i === 0) {

        var dir = './../storage/html/' + d;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            var result_dir = './../storage/html/' + d + '/' + name;
            if (!fs.existsSync(result_dir)) {
                fs.mkdirSync(result_dir);
            }
        }
    }
    request({
        uri: url,
    }, function(error, response, body) {
        fs.writeFile('./../storage/html/' + d + '/' + name + '/' + name + '_page' + i + '.html', body, function(err) {
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
            var path = './../storage/url/' + d + '/';
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
