const { deliverMessages } = require('../ServerFunctions/messageIO');
const ipc = require('node-ipc');
const { tryToWithLogger } = require('../logs/logManager');
/**
 *                               IPC SERVER                                    .
 * ENG:
 * Here we recieve one to one messages from other processes and send it back to
 * the websocket connections of this process that are connected to the sender
 * channel.
 * PT:
 * Aqui é onde recebemos as mensagens de um para um entre os processos e
 * reenviamos para todas as conexões websocket deste processo que estão
 * conectadas ao canal da conexão que nos enviou a mensagem.
 */
function ipcServerStart() {
  tryToWithLogger(() => {
    ipc.config.id = `${process.pid}`;
    ipc.config.retry = 1500;
    ipc.config.silent = true;
    ipc.serve(() =>
      ipc.server.on('message', (message) => {
        delete message.from;
        deliverMessages(message, message.channel);
      })
    );
    ipc.server.start();
  }, 'ipcServer/ipcServe.js/ipcServerStart');
}
module.exports = {
  ipcServerStart,
};
