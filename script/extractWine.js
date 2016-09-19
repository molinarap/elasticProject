var Promise = require('bluebird');
var cheerio = require('cheerio');
var chalk = require('chalk');
var request = require('request');
var fs = require('fs');
Promise.promisifyAll(fs);

var url = 'http://www.tannico.it/alghero-torbato-doc-terre-bianche-cuvee-161-2015-sella-mosca.html';

var w = {
    wines: []

};

function cleanHTML(html) {
    return new Promise(function(resolve, reject) {
        if (html) {
            console.log(chalk.red('EXTRACT INFO\'S WINE.........'));
            var $ = cheerio.load(html);
            // // elimino i tag che non contengono informazioni utili
            $('svg').remove();
            // // elimino gli attributi che non contengono informazioni utili
            // $('*').removeAttr('method').html();
            // $('*').removeAttr('action').html();
            // $('*').removeAttr('type').html();
            // $('*').removeAttr('class').html();
            // $('*').removeAttr('href').html();
            // $('*').removeAttr('style').html();
            var a = $('#product-attribute-specs-table').html();
            var array = a.split('<li> <p>');
            var new_array = {
                "url": url,
                "info_wine": []
            };
            for (var i = array.length - 1; i >= 0; i--) {
                var elem = array[i];
                if (i !== 0) {
                    var b = elem.replace(': ', '", ');
                    var c = b.replace('\n', '');
                    var d = c.replace(' </p></li>', '"}');
                    var e = d.replace('<strong>', '{"type": "');
                    var f = e.replace('</strong>', '"data": "');
                    var g = f.replace('\'', '');
                    var j = JSON.parse(g);
                    new_array.info_wine.push(j);
                }
            }

            resolve(new_array);

        } else {
            resolve("");
        }
    });
}
exports.cleanHTML = cleanHTML;



// function regexData(html) {
//     return new Promise((resolve, reject) => {
//         var cleanHtml = cleanHTML(html);
//         var stringHTML = cleanHtml.toString();
//         var phoneRegex = '(\\d{9,15})|(([+0-9]{1,4})((\\d{7,12})|(\s\\d{5,12})|(\s\\d{3}\s\\d{2}\s\\d{2}\s\\d{3})|(\s\\d{3}\s\\d{3}\s\\d{4})))|(\\d{3}(.\\d{2}){0,3})';
//         var nameRegex = '(([\>.:,;\\-_+\\(\\)|\\t|\\s|\\n|\\r])([A-Z]{1}[a-z]{2,10}\\s))([A-Z]{1}[a-z]{1,10}([\<.:,;\\-_+\\(\\)|\\t|\\s|\\n|\\r]))';
//         var emailRegex = '(([\\w|.|-]{2,40}@)(\\w{2,20}.)?(\\w{2,20}.)?(\\w{2,20}.)(\\w{2,6}))';
//         var finalRegex = new RegExp('(' + nameRegex + ')|(' + emailRegex + ')|(' + phoneRegex + ')', 'g');
//         var matches = stringHTML.match(finalRegex);
//         var cleanNames = [];
//         // matches.forEach(function(entry) {
//         //     // elimino primo e ultimo elemento che non serve
//         //     //var name = entry.substring(1, entry.length - 1);
//         //     cleanNames.push(name);
//         // });
//         resolve(matches);
//     });
// }
// exports.regexData = regexData;

function extractData(url) {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                cleanHTML(html)
                    .then(function(new_html) {
                        resolve(new_html);

                        // Promise.all([regexData(new_html)])
                        //     .then(values => {
                        //         console.log(values[0]);
                        //     });
                    });
            } else {
                console.log(error);

                reject(error);
            }
        });
    });
}
exports.extractData = extractData;

function createFileJson(data) {
    var filePath = './../data/wines.json';
    var d = JSON.stringify(data);
    return fs.writeFileAsync(filePath, d);
}
exports.createFileJson = createFileJson;

extractData(url)
    .then(function(res) {
        return createFileJson(res);
    });
//.then(flatPromiseArray)
// .then(function(r) {
//     console.log(r);
// });
