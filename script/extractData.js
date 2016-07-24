var Promise = require('bluebird');
var cheerio = require('cheerio');
var chalk = require('chalk');
var request = require('request');
var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
    api_key: '7acc071e01a374142afe6dc1fb776bd202593306'
});

var url1 = 'https://www.semanticscholar.org/paper/Effects-of-pre-shipping-marbofloxacin-ENDO-TSUCHIYA/4d433f4652f3de5115a429f81b33d53a65993312';
var url = 'https://www.tim.it/assistenza/i-consumatori/info-consumatori-fisso/contatti';
var word = 'News';


var parameters = {
    extract: 'entities',
    sentiment: 0,
    //maxRetrieve: 1,
    url: url1
};

function cleanHTML(html) {
    return new Promise(function(resolve, reject) {
        if (html) {
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
            var new_html = $.html();
            console.log(chalk.red('CLEAN HTML FILE.........'));
            resolve(new_html);
        } else {
            resolve("");
        }
    });
}
exports.cleanHTML = cleanHTML;

function alchemyData(html) {
    return new Promise((resolve, reject) => {
        alchemy_language.combined(parameters, function(err, response) {
            if (err)
                reject(console.log('error:', err));
            else
                resolve(console.log(JSON.stringify(response, null, 2)));
        });
    });
}
exports.alchemyData = alchemyData;

function regexData(html) {
    return new Promise((resolve, reject) => {
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
    });
}
exports.regexData = regexData;

function extractData(url) {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                cleanHTML(html)
                    .then(function(new_html) {
                        Promise.all([regexData(new_html), alchemyData(new_html)])
                            .then(values => {
                                console.log(values[0]);
                            });
                    });
            } else {
                reject(error);
            }
        });
    });
}
exports.extractData = extractData;

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

//regexData(url).tap(console.log)
//alchemyData(url).tap(console.log)
extractData(url).tap(console.log)
    //.then(flatPromiseArray)
    // .then(function(r) {
    //     console.log(r);
    // });
