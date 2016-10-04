var Promise = require('bluebird');
var cheerio = require('cheerio');
var chalk = require('chalk');
var path = require('path');
var request = require('request');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
    api_key: 'd190e78d1e52b42b1bb6c5727d65cfd57c810f0e'
});

// paolo@tutored.it d09d5dd4a7f94f2a0fa4f3cbda63bf3bb8695227
// info@haiteku.it d190e78d1e52b42b1bb6c5727d65cfd57c810f0e
// paolo.molinara@haiteku.it dcd350a6a24c52c59636c7c05853b7bd6984a94a
// eli108@hotmail.it 37ccecf84ea70d056fde7d7bfce842c98e2966d7
// molinarae@gmail.com 8db2fc81b70b4a96637876dca95f81a23e49d63c
// PAO.MOLINARA@stud.uniroma3.it f1a76cba64ac630815007319fcd4a317af86ef96
// prova vale 16b33a4fd59afd691b960f55217b8bb4600bf582
// 7acc071e01a374142afe6dc1fb776bd202593306

var fs = require('fs');
Promise.promisifyAll(fs);

var d = new Date();
d = d.toDateString();
var cont = 0;

var phoneRegex = '[\\+]?((\\d{5,13})|\\d{2,4}([\\-\\\\ ]\\d{2,5}){2,4}|\\d{3}([\\.\\\\ ]\\d{2,3}){3})';
var nameRegex = '([A-Z]{1}[A-Za-z]{2,10}( [A-Z]{1}[A-Za-z]{1,10}){1,4})';
var emailRegex = '(([\\w][\\w|\\.|\\-]{2,40}\\@)(\\w{2,20}.)*.(\\w{2,6}))';

var namesList = './../data/ita-names.json';
var pathPrevDir = path.join('./../storage/', d, '/url/');

var filterName = [
    'Piazza',
    'Viale',
    'Via',
    'Corso',
    'Ristorante',
    'Bar',
    'San',
    'Santo',
    'Santa'
];

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
            console.log(chalk.bgWhite.grey('CLEAN HTML FILE.........'));
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
            // CHE SCHIFO, MA DEVO CAPIRE SE FUNZIONA IL RESTO! D:
            if (allNametemp.length === 2) {
                var capName0 = capitalizeFirstLetter(allNametemp[0]);
                var capName1 = capitalizeFirstLetter(allNametemp[1]);
                if (filterName.contains(capName0) || filterName.contains(capName1)) {
                    if (!previousVal.PATTERN.dirtyName.contains(currentVal)) {
                        previousVal.PATTERN.dirtyName.push(currentVal);
                    }
                } else {
                    if (namesList.contains(capName0) || namesList.contains(capName1)) {
                        if (!previousVal.PATTERN.name.contains(currentVal)) {
                            previousVal.PATTERN.name.push(currentVal);
                        }
                    }
                }
            }
            if (allNametemp.length === 3) {
                var capName0 = capitalizeFirstLetter(allNametemp[0]);
                var capName1 = capitalizeFirstLetter(allNametemp[1]);
                var capName2 = capitalizeFirstLetter(allNametemp[2]);
                if (filterName.contains(capName0) || filterName.contains(capName1) || filterName.contains(capName2)) {
                    if (!previousVal.PATTERN.dirtyName.contains(currentVal)) {
                        previousVal.PATTERN.dirtyName.push(currentVal);
                    }
                } else {
                    if (namesList.contains(capName0) || namesList.contains(capName1) || namesList.contains(capName2)) {
                        if (!previousVal.PATTERN.name.contains(currentVal)) {
                            previousVal.PATTERN.name.push(currentVal);
                        }
                    }
                }
            }
            // allNametemp.some(function logArrayElements(element, index) {
            //     var capName = capitalizeFirstLetter(element);
            //     if (filterName.contains(capName)) {
            //         console.log(chalk.cyan(currentVal));
            //         return;
            //     } else {
            //         if (namesList.contains(capName)) {
            //             if (!previousVal.PATTERN.name.contains(currentVal)) {
            //                 previousVal.PATTERN.name.push(currentVal);
            //             }
            //         }
            //     }
            // });
            return previousVal;
        }, {
            "url": obj.url,
            "NER": obj.NER,
            "PATTERN": {
                'tel': obj.PATTERN.tel,
                'name': [],
                'dirtyName': [],
                'email': obj.PATTERN.email
            }
        });
    } else obj;
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
                                return {
                                    'url': allInfo.url,
                                    'NER': values[0],
                                    'PATTERN': values[1]
                                };
                            })
                            .then(cleanPeopleName)
                            .then(r1 => {
                                console.log(chalk.bgGreen.white(new Date().toISOString() + ' - WRITE FILE ---> ' + response.statusCode + ' | ' + allInfo.name));
                                resolve(writeHTMLFile(allInfo, r1));
                            });
                    } else {
                        resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR extractAllData ---> ' + response.statusCode + ' | ' + allInfo.url)));
                    }
                }

            });
        }, 3000);
    });
}
exports.extractAllData = extractAllData;

function regexData(url, html) {
    console.log(chalk.bgMagenta.white(new Date().toISOString() + ' - REGEX RULE WORKING ---> ' + url));
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
    return new Promise((resolve, reject) => {
        alchemy_language.combined({
            extract: 'entities',
            sentiment: 0,
            url: url
        }, function(err, response) {
            if (err) {
                resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR alchemyData ---> ', JSON.stringify(err))));
            } else {
                console.log(chalk.bgBlue.white(new Date().toISOString() + ' - ALCHEMY WORKING ON ---> ' + url));
                resolve(response.entities);
            }
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
    .map(r => extractAllData(r), { concurrency: 10 })
    .catch(function(e) {
        chalk.red(console.error(new Date().toISOString() + ' - ERROR PROMISE --->' + e));
    });

// TEST
// var url0 = 'https://www.semanticscholar.org/paper/Effects-of-pre-shipping-marbofloxacin-ENDO-TSUCHIYA/4d433f4652f3de5115a429f81b33d53a65993312';
// var url1 = 'http://www.paginebianche.it/ricerca?qs=molinara&dv=';
// var url2 = 'https://www.tutored.me/#/contacts';

// function extractAllData2() {
//     return new Promise(function(resolve, reject) {
//         request({
//             url: url1,
//             rejectUnauthorized: true,
//             strictSSL: false,
//             encoding: 'utf-8',
//             json: true
//         }, function(error, response, html) {
//             if (error) {
//                 resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR REQUEST --------> ' + error + ' | ' + url1)));
//             } else {
//                 if (response.statusCode === 200 || response.statusCode === 999 || response.statusCode === 406) {
//                     cleanHTML(html)
//                         .then(html => {
//                             return Promise.all([regexData(url1, html)]);
//                         })
//                         .then(values => {
//                             var obj = {
//                                 'url': url1,
//                                 'PATTERN': values[0]
//                             };
//                             return obj;
//                         })
//                         .then(cleanPeopleName)
//                         .then(r1 => {
//                             console.log(r1);
//                             resolve(r1);
//                         });
//                 } else {
//                     resolve(console.log(chalk.red(new Date().toISOString() + ' - ERROR extractAllData2 ---> ' + response.statusCode + ' | ' + url1)));
//                 }
//             }

//         });
//     });
// }
// exports.extractAllData2 = extractAllData2;

// Promise.all([readNamesFiles(readNamesFiles)])
//     .then(function(result) {
//         return result[0];
//     })
//     .then(extractAllData2())
//     .tap(console.log)
//     .catch(function(e) {
//         console.log("handled the error ------> " + e);
//     });
