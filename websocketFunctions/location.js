const { connections } = require('../globalVariables/dynamicRepository');
const { tryToWithLogger } = require('../logs/logManager');
function sendLocation(objMessage, channel) {
  tryToWithLogger(() => {
    if (objMessage.location != null) {
      Object.values(connections[channel]).forEach((webSocket) => {
        webSocket.send(JSON.stringify(objMessage.location));
      });
    }
  }, 'websocketFunctions/location.js/sendLocation');
}
module.exports = {
  sendLocation,
};
