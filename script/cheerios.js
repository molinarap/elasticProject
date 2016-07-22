var Promise = require('bluebird');
var cheerio = require('cheerio');
var request = require('request');

var url1 = 'http://presidenza.governo.it/AmministrazioneTrasparente/Organizzazione/TelefonoPostaElettronica/email.html';
var url = 'https://www.tim.it/assistenza/i-consumatori/info-consumatori-fisso/contatti';
var word = 'News';

function cleanHTML(html) {
    var $ = cheerio.load(html);
    // elimino i tag che non contengono informazioni utili
    $('script, link, br, meta, img').remove();
    // elimino gli attributi che non contengono informazioni utili
    $('*').removeAttr('class').html();
    $('*').removeAttr('href').html();
    $('*').removeAttr('style').html();
    var cleanHtml = $.html();
    return cleanHtml;
}
exports.cleanHTML = cleanHTML;

function searchName(url) {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                var cleanHtml = cleanHTML(html);
                var stringHTML = cleanHtml.toString();
                var phoneRegex = '(\\d{9,15})|(([+0-9]{1,4})((\\d{7,12})|(\s\\d{5,12})|(\s\\d{3}\s\\d{2}\s\\d{2}\s\\d{3})|(\s\\d{3}\s\\d{3}\s\\d{4})))|(\\d{3}(.\\d{2}){0,3})';
                var nameRegex = '(([\>.:,;\\-_+\\(\\)|\\t|\\s|\\n|\\r])([A-Z]{1}[a-z]{2,10}\\s))([A-Z]{1}[a-z]{1,10}([\<.:,;\\-_+\\(\\)|\\t|\\s|\\n|\\r]))';
                var emailRegex = '(([\\w|.|-]{2,40}@)(\\w{2,20}.)?(\\w{2,20}.)?(\\w{2,20}.)(\\w{2,6}))';
                var finalRegex = new RegExp('(' + nameRegex + ')|(' + emailRegex + ')|(' + phoneRegex + ')', 'g');
                var matches = stringHTML.match(finalRegex);
                var cleanNames = [];
                // matches.forEach(function(entry) {
                //     // elimino primo e ultimo elemento che non serve
                //     //var name = entry.substring(1, entry.length - 1);
                //     cleanNames.push(name);
                // });
                resolve(matches);
            } else {
                reject(error);
            }
        });
    });
}
exports.searchName = searchName;

function flatPromiseArray(nestedArray) {
    return nestedArray.reduce(function(previousVal, currentVal) {
        var allNametemp = currentVal.split(' ');
        var name = allNametemp[0];
        var surname = allNametemp[1];
        if (name === word || surname === word) {
            previousVal.push(currentVal);
        }
        return previousVal;
    }, []); // <= questo diventa previousVal alla prima iterazione
}
exports.flatPromiseArray = flatPromiseArray;

searchName(url).tap(console.log)
    //.then(flatPromiseArray)
    // .then(function(r) {
    //     console.log(r);
    // });
