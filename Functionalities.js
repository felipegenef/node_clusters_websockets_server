const { generateGlobalState } = require('./ServerFunctions/handleConnections');
const { connections } = require('./globalVariables/dynamicRepository');
const { closeConnection } = require('./ServerFunctions/handleConnections');
const { addConnection } = require('./ServerFunctions/handleConnections');
const { killConnection } = require('./websocketFunctions/connectionStatus');
const { sendStatus } = require('./websocketFunctions/connectionStatus');
const { sendLocation } = require('./websocketFunctions/location');
const { sendChat } = require('./websocketFunctions/chat');
const { tryToWithLogger } = require('./logs/logManager');
const PubSub = require('ipc-pubsub');
const pubsub = new PubSub('mpm:all');
pubsub.open();

/**
 *                             IPC BROADCAST COMMANDS                                 .
 * PT:
 * Aqui é onde todas as funcionabilidades internas de mensagens um para muitos são declaradas.
 * Se quiser adicionar mais uma funcionabilidade, coloque sua função dentro do objeto broadCastCommands
 * como as demais abaixo.
 * ENG:
 * Here are all the one to many message functionalities between the intern processes are declared.
 * If you want to add one just put it on the commands broadCastCommands bellow.
 *
 */
const broadCastCommands = {
  add: (msg) => {
    addConnection();
    sendBroadCast(msg);
  },
  close: () => {
    closeConnection();
  },
  'kill channel': (msg) => {
    sendBroadCast(msg);
  },
};
/**
 *                             IPC PRIVATE MESSAGE COMMANDS                                 .
 * PT:
 * Aqui é onde todas as funcionabilidades internas de mensagens um para um são declaradas.
 * Se quiser adicionar mais uma funcionabilidade, coloque sua função dentro do objeto commands
 * como as demais abaixo. É recomendável declarar suas funções em um arquivo dentro da
 * pasta websocketFunctions.
 * ENG:
 * Here are all the one to one message functionalities between the intern processes are declared.
 * If you want to add one just put it on the commands object bellow. As a sujestion we recommend declaring your
 * functions in the websocketFunctions folder.
 *
 */
const commands = {
  add: (msg) => {
    generateGlobalState(msg.from, msg.channel);
  },
  'kill channel': () => {
    if (connections[`${msg.channel}`]) {
      killChannel(msg);
    }
  },
};
/**                            WEBSOCKET FUNCTIONALITIES                            .
 * ENG:
 * Here is where all the functions our server provides are declared. You provide a key named
 * "type" in the message sent so the object can find the corresponding function. That way we
 * don`t have to create an additional condition every new function we add.
 *                                  WARNING!!!                              .
 * Don`t use "command","add","close" or "kill channel" as a "type" key! It is already an intern key
 * used on this aplication
 *
 * PT:
 * Aqui é onde se adiciona todas as funcionabilidades do servidor. Se fornece uma chave que
 * será enviada junto com a mensagem pelo cliente e essa chave dará acesso á função correspondente.
 * Desta forma, conseguimos com que não precise criar uma condicional nova para cada
 * funcionabilidade acrescentada.
 *                                  ATENÇÃO!!!                               .
 * Não use "command","add","close" ou "kill channel" como valor da chave "type"! Elas ja estão sendo usadas
 * em processos internos da aplicação.
 */
const funtionalities = {
  chat: (objMessage, channel) => {
    sendChat(objMessage, channel);
  },
  location: (objMessage, channel) => {
    sendLocation(objMessage, channel);
  },
  status: (objMessage, channel) => {
    sendStatus(objMessage, channel);
  },
  close: (objMessage, channel) => {
    killConnection(channel, objMessage.connection);
  },
};
/**
 *                             IPC PUBLIC MESSAGE SENDER                                  .
 *
 * This is where public messages are sent. Once this function is called , it sends
 * a message to every single process of the server. If you want to add new broadcast
 * functionalities , add a function on "broadcastCommands" and then, when sending
 * a message to the master process , make sure to put the key "command" with the same string
 * value as the key of your function on "broadCastCommands".
 *
 */
function sendBroadCast(msg) {
  tryToWithLogger(() => {
    pubsub.publish('all', msg);
  }, 'Functionalities.js/sendBroadCast');
}
module.exports = {
  broadCastCommands,
  commands,
  funtionalities,
};
