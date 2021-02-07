const { chats, connections } = require('../globalVariables/dynamicRepository');
const { tryToWithLogger } = require('../logs/logManager');
function sendChat(objMessage, channel) {
  tryToWithLogger(() => {
    if (objMessage.message != null) {
      chats[channel].push(
        `{"message":"${objMessage.message}","sendBy":"${
          objMessage.sendBy
        }","time":${Date.now()}}`
      );
      Object.values(connections[channel]).forEach((webSocket) => {
        webSocket.send(
          JSON.stringify({
            data: chats[`${channel}`],
          })
        );
      });
    }
  }, 'websocketFunctions/chat.js/sendChat');
}
module.exports = {
  sendChat,
};
