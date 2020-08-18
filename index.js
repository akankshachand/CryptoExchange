const express = require('express')
const app = express();
const exphbs  = require('express-handlebars');
const path = require('path');
const request = require('request');
var hbs = require('handlebars');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;

//API call to get pricing of Bitcoin from Bitstamp
function call_api_btc_1(finishedAPI){
	fetch('https://www.bitstamp.net/api/ticker/')
	.then(function (response) {
		return response.json();
	}).then(function (data) {
 		console.log(data);
 		finishedAPI(data);
	}).catch(function (error) {
		console.log(error);
	});
}

//API call to get pricing of Ethereum from Bitstamp
function call_api_eth_1(finishedAPI){
	fetch('https://www.bitstamp.net/api/v2/ticker/ethusd')
	.then(function (response) {
		return response.json();
	}).then(function (data) {
 		finishedAPI(data);
	}).catch(function (error) {
		console.log(error);
	});
}

//API call to get pricing of Bitcoin from Alpha Vantage
function call_api_btc_2(finishedAPI){
	fetch('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=JQ2BFSZC1HVHW6LW')
	.then(function (response) {
		return response.json();
	}).then(function (data) {
 		finishedAPI(data);
	}).catch(function (error) {
		console.log(error);
	});	
}

//API call to get pricing of Ethereum from Alpha Vantage
function call_api_eth_2(finishedAPI){
	fetch('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=ETH&to_currency=USD&apikey=JQ2BFSZC1HVHW6LW')
	.then(function (response) {
		return response.json();
	}).then(function (data) {
 		finishedAPI(data);
	}).catch(function (error) {
		console.log(error);
	});
}

//Set Handlebars Middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


var obj_btc_1;
var obj_eth_1;
var obj_btc_bid_2;
var obj_btc_ask_2;
var obj_eth_bid_2;
var obj_eth_ask_2;
app.get('/', function (req, res) {
    call_api_btc_1(function(doneAPIbtc){
    	obj_btc_1 = doneAPIbtc;
    });    	
    call_api_eth_1(function(doneAPIeth){
    	obj_eth_1 = doneAPIeth;
    });    		
	call_api_btc_2(function(doneAPIbtc2){
		var obj_btc_bid_2_st = doneAPIbtc2['Realtime Currency Exchange Rate']['8. Bid Price'].toString();
		obj_btc_bid_2 = parseFloat(obj_btc_bid_2_st).toFixed(2);
		var obj_btc_ask_2_st = doneAPIbtc2['Realtime Currency Exchange Rate']['9. Ask Price'].toString();
		obj_btc_ask_2 = parseFloat(obj_btc_ask_2_st).toFixed(2);
	});
	call_api_eth_2(function(doneAPIeth2){
		var obj_eth_bid_2_st = doneAPIeth2['Realtime Currency Exchange Rate']['8. Bid Price'].toString()
		obj_eth_bid_2 = parseFloat(obj_eth_bid_2_st).toFixed(2)
		var obj_eth_ask_2_st = doneAPIeth2['Realtime Currency Exchange Rate']['9. Ask Price'].toString()
		obj_eth_ask_2 = parseFloat(obj_eth_ask_2_st).toFixed(2)
    });	
	res.render('home.handlebars', {
		btc_bid_1: obj_btc_1.bid,
		btc_ask_1: obj_btc_1.ask,
		eth_bid_1: obj_eth_1.bid,
		eth_ask_1: obj_eth_1.ask,
		btc_bid_2: obj_btc_bid_2,
		btc_ask_2: obj_btc_ask_2,
		eth_bid_2: obj_eth_bid_2,
		eth_ask_2: obj_eth_ask_2,
		btc_bid_min : parseFloat(obj_btc_1.bid)<=obj_btc_bid_2 ? "Bitstamp" : "Alpha Vantage",
		btc_ask_max : parseFloat(obj_btc_1.ask)>=obj_btc_ask_2 ? "Bitstamp" : "Alpha Vantage",
		eth_bid_min : parseFloat(obj_eth_1.bid)<=obj_eth_bid_2 ? "Bitstamp" : "Alpha Vantage",
		eth_ask_max : parseFloat(obj_eth_1.ask)>=obj_eth_ask_2 ? "Bitstamp" : "Alpha Vantage",
		btc_url : "btc.png",
		eth_url : "eth.png"
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

app.use(express.static(path.join(__dirname, 'public/')));

app.listen(PORT, () => console.log('Server Listening on Port ' + PORT));