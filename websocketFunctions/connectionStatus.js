const { chats } = require('../globalVariables/dynamicRepository');
const { globalState } = require('../globalVariables/dynamicRepository');
const { connections } = require('../globalVariables/dynamicRepository');
const { tryToWithLogger } = require('../logs/logManager');
/**
 *
 *                            KILL CHANNEL                                   .
 */
function killChannel(msg) {
  tryToWithLogger(() => {
    Object.values(connections[`${msg.channel}`]).forEach((webSocket) => {
      webSocket.send('{"status":"disconnect"}');
      webSocket.terminate();
    });
    delete chats[`${msg.channel}`];
    delete globalState[`${msg.channel}`];
    delete connections[`${msg.channel}`];
  }, 'websocketFunctions/connectionStatus.js/killChannel');
}
/**
 *
 *                            KILL CONNECTION                                   .
 */
function killConnection(channel, connection) {
  tryToWithLogger(() => {
    if (connections[channel] != null) {
      Object.values(connections[channel]).forEach((webSocket) => {
        if (webSocket.userId == connection) {
          webSocket.send('{"status":"disconnect"}');
          delete connections[`${channel}`][`${connection}`];
          webSocket.terminate();
        }
      });
    }
  }, 'websocketFunctions/connectionStatus.js/killConnection');
}

function sendStatus(objMessage, channel) {
  tryToWithLogger(() => {
    if (objMessage.status != null) {
      Object.values(connections[channel]).forEach((webSocket) => {
        webSocket.send(JSON.stringify(objMessage));
      });
    }
  }, 'websocketFunctions/connectionStatus.js/sendStatus');
}
module.exports = {
  sendStatus,
  killChannel,
  killConnection,
};
