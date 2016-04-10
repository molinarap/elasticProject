// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var Bing = require('node-bing-api')({ accKey: "Avz6XU0BwrFDxpOClR75ahxB7kKyZ8zO8ngbpBhPeVQ" });
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var parent_dir = './../storage/' + d + '/';
var paths = [
    'elatic/',
    'html/',
    'url/',
    'url-html/',
];


var deleteFolderRecursive = function(parent_dir) {
    console.log('delete directory ---> ', parent_dir);
    if (fs.existsSync(parent_dir)) {
        fs.readdirSync(parent_dir).forEach(function(file, index) {
            var curPath = parent_dir + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(parent_dir);
    }
};

var createOtherDir = function() {
    for (var i = 0; i < paths.length; i++) {
        var completePath = parent_dir + paths[i];
        if (!fs.existsSync(completePath)) {
            fs.mkdirSync(completePath);
            console.log('create directory ---> ', completePath);
        } else {
            deleteFolderRecursive(completePath);
        }
    }
}

var createFolder = function() {
    if (fs.existsSync(parent_dir)) {
        deleteFolderRecursive(parent_dir);
    }
    console.log('create directory ---> ', parent_dir);
    fs.mkdirSync(parent_dir);
    createOtherDir();

};

createFolder();
