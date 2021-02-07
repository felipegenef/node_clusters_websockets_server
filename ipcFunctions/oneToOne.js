const ipc = require('node-ipc');
const { tryToWithLogger } = require('../logs/logManager');
require('events').defaultMaxListeners = 0;
/**
 *                             IPC PRIVATE MESSAGE DEALER                                  .
 *
 * ENG:
 * Send a message to a specific process.
 * PT:
 * Manda uma mensagem para um processo específico
 *
 */
async function ipcSendMessage(message, workerId) {
  tryToWithLogger(async () => {
    ipc.of[`${workerId}`].emit('message', message);
  }, 'ipcFunctions/OneToMany.js/ipcSendMessage');
}
async function connectToIPCS(workerId) {
  tryToWithLogger(async () => {
    await ipc.connectTo(`${workerId}`);
    return;
  }, 'ipcFunctions/OneToMany.js/ipcSendMessage');
}

module.exports = { ipcSendMessage, connectToIPCS };
