const { storeConnectionInfo } = require('../ServerFunctions/handleConnections');
const { newMessage } = require('../ServerFunctions/messageIO');
const { tryToWithLogger } = require('../logs/logManager');
/**
 *                        WEBSOCKET SERVER                                     .
 * ENG:
 * Here is where all the websocket interactions are made. Once a connection is recieved or lost
 * this process send a message to all other processes so they can know it. If a message
 * is recieved from the websocket connection, the process send it to all other processes
 * that have a conenction on that same connection channel.
 * PT:
 * Aqui é onde todas as interações com as conexões websocket são feitas. Uma vez que uma conexão
 * é recebida ou perdida o processo enviará uma mensagem para os demais para que eles saibam da
 * existencia dessa conexão. Se uma mensagem for recebida pela conexão websocket , o processo enviara
 * uma mensagem para todos os outros processos com conexões no mesmo canal da conexão webscoket origem.
 */
function startWebsocketServer(webSOcketServer) {
  tryToWithLogger(() => {
    webSOcketServer.on('connection', function connection(wsconnection, req) {
      storeConnectionInfo(wsconnection, req);
      wsconnection.on('message', function incoming(message) {
        newMessage(message, wsconnection);
      });
      wsconnection.on('close', function close(ws) {
        process.send({
          command: 'close',
        });
      });
    });
  }, 'websocketServer/websocektServer.js/startWebsocketServer');
}
module.exports = { startWebsocketServer };
