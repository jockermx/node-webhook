const CONN_URL = 'amqp://jocker:jokcerguest@10.11.3.182:5672';
//https://medium.com/@pankaj.panigrahi/implementing-rabbitmq-with-node-js-93e15a44a9cc

let ch = null;
amqp.connect(CONN_URL, function (err, conn) {
   conn.createChannel(function (err, channel) {
      ch = channel;
   });
});

export const publishToQueue = async (queueName, data) => {
    ch.sendToQueue(queueName, new Buffer(data));
 }
 process.on('exit', (code) => {
    ch.close();
    console.log(`Closing rabbitmq channel`);
});