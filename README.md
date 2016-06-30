# elasticProject

**Start Project**

- in system elastic dir do /bin/elasticsearch
- node app.js

**Script Parser**

- node script/createStruct.js ---> crea storage relativo l giorno in cui si esegue lo script. ATTEZIONE se lo si rilancia elimina tutto e ricrea la cartella vuota

- node script/urlJSON.js INPUT=[nome file] ---> scarica con le API di Bing le ricerche relative ai nomi del file iniziale se non viene messo prende in automatico il file *.json dentro /storage

- node script/createHTML.js ---> prende gli url scaricati precedentemente e scarica l'html creando un file su disco. Inoltre all'interno dell'HTML vengono inserite tutte le informazioni prese dalle API BING

- node script/htmlJSON.js ---> prende ogni file HTML, lo pulisce e lo mette all'interno di un file JSON insieme a tutti gli altri file relativi a un nome

- node script/elasticJSON.js ---> prende i file JSON con all'interno l'HTML e crea un file JSON per esegui il bulk delle informazioni in elastic search

**Script creazione struttura**

- node script/createStruct.js ---> crea la struttura qua sotto descritta per il salvataggio di dati

- storage
	|- [today date] ---> data di oggi
		|- elastic ----> tutti i file pseudo JSON che verranno usati da elastic search
			|- [name].json
		|- html ----> tutti i file HTML scaricati dallo script
			|- [name] ----> tutti i file HTML divisi per nome utente
				|- [name].json
		|- url ----> json con all'interno name, descriptio, title e url riferiti a una persona
			|- [name].json
		|- url-html ---> json che contiene tutti i file HTML trasformati in string
			|- [name].json

**Comandi Elastic**

caricare file indice
curl -s -XPOST localhost:9200/_bulk --data-binary "@[nome file]"

se non metto "_index" nel file
curl -s -XPOST localhost:9200/[_index]/_bulk --data-binary "@[nome file]"

se non metto "_type" nel file
curl -s -XPOST localhost:9200/[_index]/[_type]/_bulk --data-binary "@[nome file]"

per cancellare
curl -XDELETE 'http://localhost:9200/[_index]/'

