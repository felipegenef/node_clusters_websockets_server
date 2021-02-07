const { logger } = require('../logs/logManager');
const { globalState } = require('../globalVariables/dynamicRepository');
const { ipcSendMessage } = require('../ipcFunctions/oneToOne');
const { killChannel } = require('../websocketFunctions/connectionStatus');
const { funtionalities } = require('../Functionalities');
const { tryToWithLogger } = require('../logs/logManager');
/**
 *                             WEBSOCKET MESSAGE RECIEVER                                  .
 * ENG:
 * Send the websocket message back to all processes that have a connection on the same channel
 * PT:
 * Reenvia a mensagem da conexão websocket para todos os processos que tem uma conexão no mesmo canal.
 */
async function newMessage(message, onlineconnection) {
  await tryToWithLogger(async () => {
    let objMessage = JSON.parse(message);
    var channel = `${onlineconnection.channel}`;
    objMessage.channel = channel;
    objMessage.from = process.pid;
    for (var i = 0; i < globalState[`${channel}`].length; i++) {
      await ipcSendMessage(objMessage, globalState[`${channel}`][i]);
    }
  }, '[ServerFunctions/messageIO.js/newMessage');

  // console.log('received: %s', message);
}

async function deliverMessages(objMessage, channel) {
  tryToWithLogger(() => {
    if (funtionalities[`${objMessage.type}`]) {
      funtionalities[`${objMessage.type}`](objMessage, channel);
    }
  }, 'ServerFunctions/messageIO.js/deliverMessages');
}

module.exports = { newMessage, deliverMessages, killChannel };
