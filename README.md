# elasticProject

**Start Project**

- in system elastic dir do /bin/elasticsearch
- npm start || node app.js


**Script Parser**

- node script/urlJSON.js
- node script/createHTML.js


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

