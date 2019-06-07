//El siguiente código es un ejemplo de servidor web escrito en Node.js.

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const API_KEY = require('./apiKey');

const amqp = require('amqplib/callback_api');

const hostname = '127.0.0.1';
const port = 3000;

/*const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hola Mundo 2\n');
});*/
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.get('/tet', (req, res) => {
});

start();

server.post('/webhookTest', (req, res) => {
    console.log('--> /webhookTest');

    publish("", "jobs", new Buffer("work work work"));

    return res.json({
        speech: 'Something went wrong!',
        displayText: 'Something went wrong!',
        source: 'get-movie-details'
    });
});


function start() {
    console.log('###################### conectando #######################');
    amqp.connect('amqp://jocker:jokcerguest@10.11.3.182:5672', function(error, connection) {
        if (error) {
            throw error;
          }
          connection.createChannel(function(error, channel) {
            if (error) {
              throw error;
            }
            var queue = 'hello';
            var msg = 'Hello world xxx';
        
            channel.assertQueue(queue, {
              durable: false
            });
        
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
          });
    });
  }

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});