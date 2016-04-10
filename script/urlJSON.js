// http://www.pizzanapoletana.org/albo_pizzaioli_show.php?naz=Elenco

var Bing = require('node-bing-api')({ accKey: "Avz6XU0BwrFDxpOClR75ahxB7kKyZ8zO8ngbpBhPeVQ" });
var jsonfile = require('jsonfile');
var fs = require('fs');

var d = new Date();
d = d.toLocaleDateString();

var path = './../storage/url/';
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

var getFilePizza = new Promise(
    function(resolve, reject) {
        var file = './../storage/pizza_men.json'
        jsonfile.readFile(file, function(err, obj) {
            var pizza_men = obj;
            resolve(pizza_men);
        });
    }
);

var getBingUrl = function(word) {
    return new Promise(function(resolve, reject) {
        // console.log('getBingUrl');
        // console.log('getBingUrlSearch');
        Bing.web(word, {
            skip: 5, // Skip first 3 results
            options: ['DisableLocationDetection', 'EnableHighlighting']
        }, function(error, res, body) {
            // console.log(body.d.results);
            var url = {
                'name': word,
                'web': []
            };
            for (var i = 0; i < body.d.results.length; i++) {
                var web = {
                    'title': body.d.results[i].Title,
                    'description': body.d.results[i].Description,
                    'url': body.d.results[i].Url
                }
                url.web.push(web);
            }
            console.log(word);
            resolve(url);
        })

    });
};

var writeFileUrl = function(JSONPizzaioli) {
    var dir = './../storage/url/' + d;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    var file = './../storage/url/' + d + '/' + JSONPizzaioli.name + '.json';
    jsonfile.writeFile(file, JSONPizzaioli, function(err) {
        if (err) {
            console.error('ERROR: ', err);
        }
    })

}

var all = function() {
    getFilePizza
        .then(function(arrayPizzaioli) {
            // console.log('arrayPizzaioli: ', arrayPizzaioli.pizza_men[1]);
            return getBingUrl(arrayPizzaioli.pizza_men[1]);
        })
        .then(function(JSONPizzaioli) {
            // console.log('urlPizzaioli: ', urlPizzaioli);

            writeFileUrl(JSONPizzaioli);
        });
};

all();
