var request = require("request");
var cheerio = require('cheerio');
var util = require('util');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

var d = new Date();
d = d.toDateString();
var pathPrevDir = path.join('./../storage/', d, '/url/');

// leggo i file nella dir pathPrevDir
// e ritorno un array di questi
function readFiles() {
    return fs.readdirAsync(pathPrevDir);
}
exports.readFiles = readFiles;

function cleanHTML(html) {
    var $ = cheerio.load(html);
    // elimino i tag che non contengono informazioni utili
    $('script, link, br, meta, img').remove();
    // elimino gli attributi che non contengono informazioni utili
    $('*').removeAttr('method').html();
    $('*').removeAttr('action').html();
    $('*').removeAttr('type').html();
    $('*').removeAttr('class').html();
    $('*').removeAttr('href').html();
    $('*').removeAttr('style').html();
    var cleanHtml = $.html();
    return cleanHtml;
}
exports.cleanHTML = cleanHTML;

function download(web) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            request({
                url: web.url,
                rejectUnauthorized: true,
                strictSSL: false,
                encoding: 'utf-8',
                json: true
            }, function(error, response, html) {
                // var cleanHtml;
                // if (html) {
                //     cleanHtml = cleanHTML(html);
                // } else {
                //     cleanHtml = " ";
                // }
                var infoPage = {
                    "name": web.name,
                    "title": web.title,
                    "description": web.description,
                    "url": web.url,
                };
                var infoPageSting = JSON.stringify(infoPage);

                if (error) {
                    resolve(chalk.red(console.log('ERROR FILE --------> ' + error + ' | ' + web.url)));
                } else {
                    if (response.statusCode === 200 || response.statusCode === 999) {
                        var allHml = '<!--INFO' + infoPageSting + 'INFO-->\n' + html;
                        // var allHml = '<!--INFO' + infoPageSting + 'INFO-->\n' + cleanHtml;
                        // var pathHtmlFile = path.join('./../storage/', d, '/html/', web.name, '/', web.name, '_page', web.page, '.html');
                        var pathHtmlFile = './../storage/' + d + '/html/' + web.name + '/' + web.name + '_page' + web.page + '.html';
                        resolve(console.log(chalk.green('WRITE FILE --------> ' + response.statusCode + ' | ' + pathHtmlFile)));
                        resolve(writeHTMLFile(web, allHml));
                    } else {
                        resolve(chalk.yellow(console.log('ERROR FILE --------> ' + response.statusCode + ' | ' + web.url)));
                    }
                }
            });
        }, 5000);

    });
}
exports.download = download;

function writeHTMLFile(web, data) {
    var filePath = `./../storage/${d}/html/${web.name}/${web.name}_page-${web.page}.html`;
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
    //.each(html => download(html))
    .map(html => download(html), { concurrency: 10 })
    .catch(err => {
        chalk.red(console.error('ERROOOOOOOOOOOR ------->' + err));
    });
