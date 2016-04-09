// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var Bing = require('node-bing-api')({ accKey: "Avz6XU0BwrFDxpOClR75ahxB7kKyZ8zO8ngbpBhPeVQ" });
var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var path = './back_job/url/';
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

var writeFileUrl = function(word) {
    var w = 'Pizza';
    var url = { 'siteUrl': [] };
    var getBingUrl = new Promise(
        function(resolve, reject) {
            Bing.web(w, {
                skip: 5, // Skip first 3 results
                options: ['DisableLocationDetection', 'EnableHighlighting']
            }, function(error, res, body) {
                for (var i = 0; i < body.d.results.length; i++) {
                    url.name = w;
                    url.siteUrl.push(body.d.results[i].Url);
                    console.log(body.d.results[i].Url);
                }
                resolve(url);
            })
        }
    );

    getBingUrl.then(
            function(result) {
                var file = './back_job/url/' + d + '.json'
                jsonfile.writeFile(file, result, function(err) {
                    if (err) {
                        console.error('ERROR: ', err);
                    }
                })
            })
        .catch(
            function(reason) {
                console.log('Handle rejected promise (' + reason + ') here.');
            });

};

writeFileUrl();
