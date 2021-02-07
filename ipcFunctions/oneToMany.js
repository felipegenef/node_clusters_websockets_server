const PubSub = require('ipc-pubsub');
const pubsub = new PubSub('mpm:all');
const { broadCastCommands, commands } = require('../Functionalities');
const { tryToWithLogger } = require('../logs/logManager');
pubsub.open();

/**
 *                         PUBLIC MESSAGE DELIVER                           .
 * ENG:
 * Here is where all the aplication`s public messages are recieved before sending
 * it back to the "all" channel. Any process who want to send something to all others
 * need to send it here first. Then it is finaly sent back to the others.If you want to
 * add a functionality just add it on the broadCastCommands object and put a key called
 * command in it so the reader function can find it in the object.
 * PT:
 * Aqui é onde todas as mensagens publicas da aplicação sao recebidas antes de serem
 * reenviadas para o canal "all". Qualquer processo que quiser enviar algo para todos
 * os demais devera enviar uma mensagem pra ca.
 *
 */
function dealWithBroadCast(worker) {
  tryToWithLogger(() => {
    worker.on('message', function (msg) {
      if (msg.command) {
        broadCastCommands[`${msg.command}`](msg);
      }
    });
  }, 'ipcFunctions/oneToMany.js/dealWithBroadCast');
}

/**
 *                         PUBLIC MESSAGE RECIEVER                           .
 * ENG:
 * Here is where all the aplication`s public messages are recieved and delt with.
 * If you want to add a functionality, just add it on the "commands" object and then
 * add the command key on the message.
 * PT:
 * Aqui é onde todas as mensagens publicas da aplicação sao recebidas e trabalhadas.
 * Se quiser adicionar uma funcionabilidade, adicione ela no objeto commands e então
 * adicione também uma chave command no objeto da mensagem.
 *
 */
async function listenToBroadCast() {
  tryToWithLogger(async () => {
    await pubsub.subscribe('all', (msg) => {
      tryToWithLogger(() => {
        commands[`${msg.command}`](msg);
      }, 'ipcFunctions/oneToMany.js/listenToBroadCast');
    });
  }, 'ipcFunctions/oneToMany.js/listenToBroadCast');
}

module.exports = {
  listenToBroadCast,
  dealWithBroadCast,
};
