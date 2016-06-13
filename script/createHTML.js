var request = require("request");
var util = require('util');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
Promise.promisifyAll(fs);
Promise.promisifyAll(request, { multiArgs: true });

var d = new Date();
d = d.toLocaleDateString();
var pathPrevDir = path.join('./../storage/', d, '/url/');

// leggo i file nella dir pathPrevDir
// e ritorno un array di questi
function readFiles() {
    return fs.readdirAsync(pathPrevDir);
}
exports.readFiles = readFiles;

function download(web) {
    return new Promise(function(resolve, reject) {
        request({
            url: web.url,
            rejectUnauthorized: true,
            strictSSL: false,
            encoding: 'utf-8',
            json: true
        }, function(error, response, body) {
            var infoPage = {
                "name": web.name,
                "title": web.title,
                "description": web.description,
                "url": web.url,
            };
            var infoPageSting = JSON.stringify(infoPage);
            if (error) {
                reject(console.log('ERROR FILE --------> ' + error + ' | ' + web.url));
            } else {
                if (response.statusCode === 200) {
                    var allHml = '<!--INFO' + infoPageSting + 'INFO-->\n' + body;
                    // var pathHtmlFile = path.join('./../storage/', d, '/html/', web.name, '/', web.name, '_page', web.page, '.html');
                    var pathHtmlFile = './../storage/' + d + '/html/' + web.name + '/' + web.name + '_page' + web.page + '.html';
                    resolve(console.log('WRITE FILE --------> ' + response.statusCode + ' | ' + pathHtmlFile));
                    resolve(writeHTMLFile(web, allHml));
                } else {
                    reject(console.log('ERROR FILE --------> ' + response.statusCode + ' | ' + web.url));
                }
            }
            //return writeHTMLFile(web, allInfo);
        });
    });
}
exports.download = download;

function writeHTMLFile(web, data) {
    var filePath = `./../storage/${d}/html/${web.name}/${web.name}_page-${web.page}.html`;
    console.log(filePath)

    // var pathHtmlFile = './../storage/' + d + '/html/' + web.name + '/' + web.name + '_page' + web.page + '.html';
    return fs.writeFileSync(filePath, data);
}
exports.writeHTMLFile = writeHTMLFile;

function createFolder(allPath) {
    var onlyName = allPath.split('.json')[0];
    var pathNextDir = path.join('./../storage/', d, '/html/', onlyName);
    return fs.statAsync(pathNextDir).return(allPath)
        .catch(err => fs.mkdirAsync(pathNextDir));
}
exports.createFolder = createFolder;

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

readFiles()
    .map(dir => createFolder(dir))
    .map(file => getFileUrl(file))
    .then(flatPromiseArray)
    // ho un array di oggetti web da cui devo scaricare l'HTML
    .map(html => download(html))
    .catch(err => {
        console.error('ERROOOOOOOOOOOR ------->' + err);
    });
