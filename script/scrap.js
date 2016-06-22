var noodle = require('noodlejs');

noodle
    .query({
        url: 'http://www.pizzanapoletana.org/show_pizzaiolo.php?id_albo=272',
        type: 'html',
        map: {
            "info": {
                selector: 'td.testo_center',
                extract: 'html'
            }
        }
    })
    .then(function(results) {
        console.log('Info Pizzaiolo', JSON.stringify(results.results[0].results.info[1]));
    });
