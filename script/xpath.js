var noodle = require('noodlejs');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

noodle
    .query({
        url: 'http://www.thelimited.com/product/knit-tank/3987456.html?cgid=online-shops-essential-tops&dwvar_3987456_colorCode=1&prefn1=saleStatus&start=9&prefv1=regular&ppid=c9',
        type: 'html',
        map: {
            "element": {
                selector: 'div.item-number',
                extract: 'html'
            },
            "id": {
                selector: 'div.item-number > span',
                extract: 'content'
            }
        }
    })
    .then(function(results) {
        var r = JSON.stringify(results);
        var r2 = results.results[0].results.element[0].toString();
        var r3 = r2.split('# ');
        var doc = new dom().parseFromString(r3[1]);
        var title = xpath.select('span/text()', doc).toString();
        console.log('Info SKU', title);
    });

//*[@id="pdpMain"]/div[3]/div[2]/div/div[1]/div/div[2]/span
/*
"Item# <span itemprop=\"identifier\" content=\"sku:3987456\">3987456</span>"

estraggo ID ---> 3987456
estraggo regola xpath ---> /div[3]/div[2]/div/div[1]/div/div[2]/span/ + text()
creo file json --->

//*[@id="pdpMain"]/div[3]/div[2]/div/div[1]/div/div[2]/span/ + "text()"
estraggo regola xpath


Info SKU {"results":[
  {"results":{"id":["sku:3987456"],
  "element":["Item# <span itemprop=\"identifier\" content=\"sku:3987456\">3987456</span>"]},
  "created":"2016-06-22T14:11:16.975Z"}
]}
*/
