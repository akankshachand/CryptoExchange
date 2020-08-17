const express = require('express')
const app = express();
const exphbs  = require('express-handlebars');
const path = require('path');
const request = require('request');
var hbs = require('handlebars')

const PORT = process.env.PORT || 3000;

//API call to get pricing of Bitcoin from Bitstamp
function call_api_btc_1(finishedAPI){
	request('https://www.bitstamp.net/api/ticker/', {json : true}, (err, res, body) => {
	if (err) {return console.log(err);}
	if (res.statusCode === 200){
		finishedAPI(body);
		};
	});	
}

//API call to get pricing of Ethereum from Bitstamp
function call_api_eth_1(finishedAPI){
	request('https://www.bitstamp.net/api/v2/ticker/ethusd/', {json : true}, (err, res, body) => {
	if (err) {return console.log(err);}
	if (res.statusCode === 200){
		finishedAPI(body);
		};
	});	
}

//API call to get pricing of Bitcoin from Alpha Vantage
function call_api_btc_2(finishedAPI){
	request('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=HXBRO8DTOYT11XBZ', {json : true}, (err, res, body) => {
	if (err) {return console.log(err);}
	if (res.statusCode === 200){
		finishedAPI(body);
		};
	});	
}

//API call to get pricing of Ethereum from Alpha Vantage
function call_api_eth_2(finishedAPI){
	request('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=ETH&to_currency=USD&apikey=HXBRO8DTOYT11XBZ', {json : true}, (err, res, body) => {
	if (err) {return console.log(err);}
	if (res.statusCode === 200){
		finishedAPI(body);
		};
	});	
}

//Set Handlebars Middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.get('/', function (req, res) {
    call_api_btc_1(function(doneAPIbtc){    	
    	call_api_eth_1(function(doneAPIeth){    		
    		call_api_btc_2(function(doneAPIbtc2){
    			var obj_btc_bid_2_st = doneAPIbtc2['Realtime Currency Exchange Rate']['8. Bid Price'].toString()
    			var obj_btc_bid_2 = parseFloat(obj_btc_bid_2_st).toFixed(2)
    			var obj_btc_ask_2_st = doneAPIbtc2['Realtime Currency Exchange Rate']['9. Ask Price'].toString()
    			var obj_btc_ask_2 = parseFloat(obj_btc_ask_2_st).toFixed(2)
    			call_api_eth_2(function(doneAPIeth2){
    				var obj_eth_bid_2_st = doneAPIeth2['Realtime Currency Exchange Rate']['8. Bid Price'].toString()
    				var obj_eth_bid_2 = parseFloat(obj_eth_bid_2_st).toFixed(2)
    				var obj_eth_ask_2_st = doneAPIeth2['Realtime Currency Exchange Rate']['9. Ask Price'].toString()
		    		var obj_eth_ask_2 = parseFloat(obj_eth_ask_2_st).toFixed(2)
			    	res.render('home', {
			    		btc_bid_1: doneAPIbtc.bid,
			    		btc_ask_1: doneAPIbtc.ask,
			    		eth_bid_1: doneAPIeth.bid,
			    		eth_ask_1: doneAPIeth.ask,
			    		btc_bid_2: obj_btc_bid_2,
			    		btc_ask_2: obj_btc_ask_2,
			    		eth_bid_2: obj_eth_bid_2,
			    		eth_ask_2: obj_eth_ask_2,
			    		btc_bid_min : parseFloat(doneAPIbtc.bid)<=obj_btc_bid_2 ? "Bitstamp" : "Alpha Vantage",
			    		btc_ask_max : parseFloat(doneAPIbtc.ask)>=obj_btc_ask_2 ? "Bitstamp" : "Alpha Vantage",
			    		eth_bid_min : parseFloat(doneAPIeth.bid)<=obj_eth_bid_2 ? "Bitstamp" : "Alpha Vantage",
			    		eth_ask_max : parseFloat(doneAPIeth.ask)>=obj_eth_ask_2 ? "Bitstamp" : "Alpha Vantage",
			    		btc_url : "btc.png",
			    		eth_url : "eth.png"
				    });
			    });
		    });
	    });
	});
});


hbs.registerHelper("apiNameAV", function(name) {
	return name=="Alpha Vantage"
});

hbs.registerHelper("apiNameBS", function(name) {
	return name=="Bitstamp"
});

//About Page Route
app.get('/about.html', function (req, res) {
    res.render('about');
});

app.use(express.static(path.join(__dirname, 'Public/')));

app.listen(PORT, () => console.log('Server Listening on Port ' + PORT));