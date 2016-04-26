/**
 * @autor: Francisco de Assis de Souza Rodrigues
 * @site: http://clubedosgeeks.com.br
 * @site: http://rodriguesfas.com.br
 * @licesa: MIT
 * @data: 16/04/2016
 */

 // Express é um framework que permite cria app web com facilidade com node.js.
 var app = require("express")();
 var express = require("express");

 // Na pasta public é onde colocaremos o arquivo Chart.js
 app.use(express.static(__dirname + '/public'));

 var http = require("http").Server(app);

 //var http = require('http').createServer(servidor);
 var fs = require('fs');
 var io = require('socket.io').listen(http);
 var five = require('johnny-five');

 var Fn = five.Fn; //Define uma lib do johnny-five

 var arduino = new five.Board();

/**
 * arduino.on - 
 */
 arduino.on('ready', function(){
 	console.log("Arduino Pronto!");

/**
 * Define o sensor de lus LDR...
 * scale - Usa-se para definir que a leitura acontese de 0 à 100 [valorInicial, valorFinal]
 */
 var sensorLDR = new five.Sensor("A0").scale([0, 100]);
 var sensorDHT11 = new five.Sensor("A1");
 var sensorHIGROMETRO = new five.Sensor("A2");
 var sensorHIG_POTEN = new five.Sensor("A3");
 var sensorCHUVA = new five.Sensor("A4").scale([0, 100]);
 var sensorLM35 = new five.Thermometer({
 	controller: "LM35",
 	pin: "A5"
 });
 var LED = new five.Led(13);


 /**
 * sensorLDR.on - Envia os valores lidos pelo sensor, para o socket.io exibir na pagina html..
 * io.emit - envia dados.
 * toFixed() - Arendondamento de valores.
 */
 sensorLDR.on('change', function(){

 	var valor = Math.round(this.value)
 	io.emit('sensorLDR',  Fn.map(valor, 0, 1023, 100, 0));

 });

 sensorHIG_POTEN.on('change', function(){
 	//io.emit('sensorHIG_POTEN', this.value);
 });

 sensorHIGROMETRO.on('change', function(){
 	var hygrometer = Fn.map(this.value, 0, 1023, 100, 0);

 	//console.log(hygrometer)
 	io.emit('sensorHIG_POTEN', hygrometer);
 });

 sensorCHUVA.on('change', function(){
 	io.emit('sensorCHUVA', this.value.toFixed() + 'mm');
 });

 sensorLM35.on("data", function() {
 	io.emit('sensorLM35', this.celsius.toFixed() + "°C");
 	//io.emit('sensorLM35', this.fahrenheit + "°F");
 });

 io.sockets.on('connection', function (socket) {
    socket.on('click', function () {
      LED.toggle();
    });
  });

});

 /**
 * app.get - 
 */
 app.get("/", function(req, res){
 	res.sendfile("view/index.html");
 });
 

/**
 * http.listen - 
 */
 http.listen(4000, function(){
 	console.log("Servidor On-line em http://localhost:4000");
 	console.log("Para sair Ctrl+C");
 });