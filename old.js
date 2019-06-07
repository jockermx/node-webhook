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
    amqp.connect('amqp://jocker:jokcerguest@10.11.3.182:5672', function(err, conn) {
      if (err) {
        console.error("[AMQP]", err.message);
        return setTimeout(start, 1000);
      }
      /*conn.on("error", function(err) {
        if (err.message !== "Connection closing") {
          console.error("[AMQP] conn error", err.message);
        }
      });
      conn.on("close", function() {
        console.error("[AMQP] reconnecting");
        return setTimeout(start, 1000);
      });*/
      console.log("[AMQP] connected");
      amqpConn = conn;
      whenConnected();
    });
  }

  function whenConnected() {
    startPublisher();
    startWorker();
  }

  var pubChannel = null;
var offlinePubQueue = [];
function startPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
      ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });

    pubChannel = ch;
    while (true) {
      var [exchange, routingKey, content] = offlinePubQueue.shift();
      publish(exchange, routingKey, content);
    }
  });
}

function publish(exchange, routingKey, content) {
    try {
      pubChannel.publish(exchange, routingKey, content, { persistent: true },
                        function(err, ok) {
                          if (err) {
                            console.error("[AMQP] publish", err);
                            offlinePubQueue.push([exchange, routingKey, content]);
                            pubChannel.connection.close();
                          }
                        });
    } catch (e) {
      console.error("[AMQP] publish", e.message);
      offlinePubQueue.push([exchange, routingKey, content]);
    }
  }

  function startWorker() {
    amqpConn.createChannel(function(err, ch) {
      if (closeOnErr(err)) return;
      ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
      });
      ch.on("close", function() {
        console.log("[AMQP] channel closed");
      });
  
      ch.prefetch(10);
      ch.assertQueue("jobs", { durable: true }, function(err, _ok) {
        if (closeOnErr(err)) return;
        ch.consume("jobs", processMsg, { noAck: false });
        console.log("Worker is started");
      });
    });
  }

  function processMsg(msg) {
    work(msg, function(ok) {
      try {
        if (ok)
          ch.ack(msg);
        else
          ch.reject(msg, true);
      } catch (e) {
        closeOnErr(e);
      }
    });
  }

  function work(msg, cb) {
    console.log("PDF processing of ", msg.content.toString());
    cb(true);
  }

  function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
  }

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});