const { v4: uuidv4 } = require('uuid');
const { chats } = require('../globalVariables/dynamicRepository');
const { connections } = require('../globalVariables/dynamicRepository');
const { globalState } = require('../globalVariables/dynamicRepository');
const { connectionsCount } = require('../globalVariables/dynamicRepository');
const { tryToWithLogger } = require('../logs/logManager');
const colors = require('colors/safe');
/**
 *                             STORE CONNECTION INFO                                  .
 */
function storeConnectionInfo(wsconnection, req) {
  tryToWithLogger(() => {
    wsconnection.userId = uuidv4().replace('/', '');
    var channel = req.url.substring(1, req.url.lenght);
    wsconnection.channel = channel;
    process.send({
      command: 'add',
      from: process.pid,
      channel: channel,
    });
    tryToWithLogger(() => {
      wsconnection.send(
        JSON.stringify({
          status: 'connected',
          connectionId: wsconnection.userId,
          workerId: process.pid,
        })
      );
    });

    generateChannel(channel, wsconnection);
    generateChatObj(wsconnection);
  }, 'ServerFunctions/HandleConnections.js/storeConnectionInfo');
}
/**
 *                             GENERATE CHANNEL                                  .
 */
function generateChannel(channel, wsconnection) {
  tryToWithLogger(() => {
    if (connections[`${channel}`] == null) {
      connections[`${channel}`] = {};
      connections[`${channel}`][`${wsconnection.userId}`] = wsconnection;
    } else {
      connections[`${channel}`][`${wsconnection.userId}`] = wsconnection;
    }
  }, 'ServerFunctions/HandleConnections.js/generateChannel');
}
/**
 *                             GENERATE GLOBAL STATE                                .
 */
function generateGlobalState(workerId, channel) {
  tryToWithLogger(() => {
    if (globalState[`${channel}`] == null) {
      globalState[`${channel}`] = [];
      globalState[`${channel}`].push(workerId);
    } else {
      if (globalState[`${channel}`].indexOf(workerId) == -1) {
        globalState[`${channel}`].push(workerId);
      }
    }
  }, 'ServerFunctions/HandleConnections.js/generateGlobalState');
}
/**
 *                             CREATE CHAT VARIABLES                                  .
 */
function generateChatObj(wsconnection) {
  tryToWithLogger(() => {
    if (chats[`${wsconnection.channel}`] == null) {
      chats[`${wsconnection.channel}`] = [];
    } else {
      let data = {
        data: chats[`${wsconnection.channel}`],
      };
      wsconnection.send(JSON.stringify(data));
    }
  }, 'ServerFunctions/HandleConnections.js/generateChatObj');
}
/**
 *                             ADD CONNECTION CONTROLLER                                  .
 *
 */
async function addConnection() {
  connectionsCount.number = connectionsCount.number + 1;
  console.log(
    colors.cyan('Active connections : '),
    colors.yellow(`${connectionsCount.number}`)
  );
}
/**
 *                             CLOSE CONNECTION CONTROLLER                                .
 *
 *
 */
async function closeConnection() {
  connectionsCount.number = connectionsCount.number - 1;
  console.log(
    colors.cyan('Active connections : '),
    colors.yellow(`${connectionsCount.number}`)
  );
}
module.exports = {
  storeConnectionInfo,
  closeConnection,
  addConnection,
  generateGlobalState,
};
