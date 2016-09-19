var Promise = require('bluebird');
var cheerio = require('cheerio');
var chalk = require('chalk');
var path = require('path');
var request = require('request');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
    api_key: 'd09d5dd4a7f94f2a0fa4f3cbda63bf3bb8695227'
});

var fs = require('fs');
Promise.promisifyAll(fs);

var d = new Date();
d = d.toDateString();
var cont = 0;

var phoneRegex = '((\\+)?\\b(\\d{0,4})((( |\\-|\\\\)?(\\d{1,5})){7})\\b|((\\d{3})(\\.\\d{2,3}){3}))';
var nameRegex = '([A-Z]{1}[A-Za-z]{2,10}( [A-Z]{1}[A-Za-z]{1,10}){1,4})';
var emailRegex = '(([\\w][\\w|\\.|\\-]{2,40}\\@)(\\w{2,20}.)*.(\\w{2,6}))';

var namesList = './../data/ita-names.json';
var pathPrevDir = path.join('./../storage/', d, '/url/');

function readUrlDirs() {
    return fs.readdirAsync(pathPrevDir);
}
exports.readUrlDirs = readUrlDirs;

function createFolder(allPath) {
    var onlyName = allPath.split('.json')[0];
    var pathNextDir = path.join('./../storage/', d, '/json-info/', onlyName);
    return fs.statAsync(pathNextDir).return(allPath)
        .catch(err => fs.mkdirAsync(pathNextDir));
}
exports.createFolder = createFolder;

function readNamesFiles() {
    console.log('LEGGO IL FILE ----------> ' + namesList);
    return fs.readFileAsync(namesList, 'utf8')
        .then(function(obj) {
            var objJSON = JSON.parse(obj);
            namesList = objJSON.names;
        });
}
exports.readNamesFiles = readNamesFiles;

function getFileUrl(filePath) {
    var jsonFile = path.join(pathPrevDir, filePath);
    return fs.readFileAsync(jsonFile, 'utf8')
        .then(JSON.parse)
        .then(jsonData => {
            return jsonData.web.map(function(webObj, index) {
                return {
                    name: jsonData.name,
                    page: index,
                    url: webObj.url,
                    description: webObj.description,
                    title: webObj.title
                };
            });
        });
}
exports.getFileUrl = getFileUrl;

function flatPromiseArray(nestedArray) {
    return nestedArray.reduce(function(previousVal, currentVal) {
        return previousVal.concat(currentVal);
    }, []); // <= questo diventa previousVal alla prima iterazione
}
exports.flatPromiseArray = flatPromiseArray;

function cleanHTML(html) {
    return new Promise(function(resolve, reject) {
        if (html) {
            var $ = cheerio.load(html);
            // elimino i tag che non contengono informazioni utili
            $('script, link, br, img, style, svg').remove();
            // elimino gli attributi che non contengono informazioni utili
            $('*').removeAttr('method').html();
            $('*').removeAttr('action').html();
            $('*').removeAttr('type').html();
            $('*').removeAttr('class').html();
            $('*').removeAttr('href').html();
            $('*').removeAttr('style').html();
            var new_html = $.html();
            console.log(chalk.red('CLEAN HTML FILE.........'));
            resolve(new_html);
        } else {
            resolve("");
        }
    });
}
exports.cleanHTML = cleanHTML;

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;

Array.prototype.contains = function(needle) {
    for (var i in this) {
        if (this[i] == needle) return true;
    }
    return false;
};

function cleanPeopleName(obj) {
    var nestedArray = obj.PATTERN.dirtyName;
    if (obj.PATTERN.dirtyName !== [] && obj.PATTERN.dirtyName !== null) {
        return nestedArray.reduce(function(previousVal, currentVal) {
            var allNametemp = currentVal.split(' ');
            allNametemp.forEach(function logArrayElements(element, index) {
                var capName = capitalizeFirstLetter(element);
                // if (element === 'Via') {
                //     console.log(chalk.red(element));
                // }
                // if (element === 'Piazza') {
                //     console.log(chalk.cyan(element));
                // }
                if (namesList.contains(capName)) {
                    if (!previousVal.PATTERN.name.contains(currentVal)) {
                        previousVal.PATTERN.name.push(currentVal);
                    }
                }
            });
            return previousVal;
        }, {
            "url": obj.url,
            "NER": obj.NER,
            "PATTERN": {
                'tel': obj.PATTERN.tel,
                'name': [],
                'email': obj.PATTERN.email
            }
        });
    }
}
exports.cleanPeopleName = cleanPeopleName;

function matchRegex(html, regex) {
    var stringHTML = html.toString();
    var rgx = new RegExp('(' + regex + ')', 'g');
    return stringHTML.match(rgx);
}
exports.matchRegex = matchRegex;

function extractAllData(allInfo) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            cont = cont + 1;
            console.log(chalk.white.bgYellow(new Date().toISOString() + ' - NOME --------> ' + allInfo.name));
            console.log(chalk.magenta(new Date().toISOString() + ' - CONTATORE --------> ' + cont));
            request({
                url: allInfo.url,
                rejectUnauthorized: true,
                strictSSL: false,
                encoding: 'utf-8',
                json: true
            }, function(error, response, html) {
                if (error) {
                    resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR REQUEST --------> ' + error + ' | ' + allInfo.url)));
                } else {
                    if (response.statusCode === 200 || response.statusCode === 999 || response.statusCode === 406) {
                        cleanHTML(html)
                            .then(html => {
                                return Promise.all([alchemyData(allInfo.url), regexData(allInfo.url, html)]);
                            })
                            .then(values => {
                                var obj = {
                                    'url': allInfo.url,
                                    'NER': values[0],
                                    'PATTERN': values[1]
                                };
                                return obj;
                            })
                            .then(cleanPeopleName)
                            .then(r1 => {
                                console.log(chalk.green(new Date().toISOString() + ' - WRITE FILE ---> ' + response.statusCode + ' | ' + allInfo.name));
                                resolve(writeHTMLFile(allInfo, r1));
                            });


                    } else {
                        resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR FILE ---> ' + response.statusCode + ' | ' + allInfo.url)));
                    }
                }

            });
        }, 1000);
    });
}
exports.extractAllData = extractAllData;

function regexData(url, html) {
    console.log(chalk.green(new Date().toISOString() + ' - REGEX RULE WORKING ---> ' + url));
    return new Promise((resolve, reject) => {
        var allPhones = matchRegex(html, phoneRegex);
        var allNames = matchRegex(html, nameRegex);
        var allEmails = matchRegex(html, emailRegex);
        var cleanNames = [];
        var allInfo = {
            'tel': allPhones,
            'dirtyName': allNames,
            'email': allEmails
        };
        resolve(allInfo);
    });
}
exports.regexData = regexData;

function alchemyData(url) {
    console.log(chalk.green(new Date().toISOString() + ' - ALCHEMY WORKING ON ---> ' + url));
    return new Promise((resolve, reject) => {
        alchemy_language.combined({
            extract: 'entities',
            sentiment: 0,
            url: url
        }, function(err, response) {
            if (err)
                resolve(console.log('error:', err));
            else
                resolve(response.entities);
        });
    });
}
exports.alchemyData = alchemyData;

function writeHTMLFile(web, data) {
    var filePath = `./../storage/${d}/json-info/${web.name}/${web.name}_page-${web.page}.json`;
    return fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
exports.writeHTMLFile = writeHTMLFile;

Promise.all([readNamesFiles(readNamesFiles), readUrlDirs()])
    .then(function(result) {
        return result[1];
    })
    .map(p => createFolder(p))
    .map(file => getFileUrl(file))
    .then(flatPromiseArray)
    //.tap(console.log)
    .map(r => extractAllData(r), { concurrency: 10 })
    .catch(function(e) {
        console.log("handled the error ------> " + e);
    });

//alchemyData("https://sites.google.com/site/villasaltoparrocchia/home/sant-antonio-abate");


// leggo lista di nomi e me la salvo in una variabile globale
// leggo file nella cartella url
// per ogni file estraggo le informazioni
// tutte le informazioni le carico in un array
