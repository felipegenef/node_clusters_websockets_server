const express = require('express');
const httpController = express.Router();
const { ipcSendMessage } = require('../ipcFunctions/oneToOne');
const { tryToWithLogger } = require('../logs/logManager');
/**
 *                             KILL SPECIFIC CONNECTION                                  .
 *ENG:
 *Sends a direct message to the process that has that connection so it can kill it.
 *PT:
 *Manda uma mensagem direta para o processo que tem esta conexão para que este possa
 *matar a conexão.
 *
 */
httpController.delete(
  '/kill-connection/:token/:connection/:worker',
  (dto, resp) => {
    tryToWithLogger(() => {
      var channel = dto.params.token;
      var connection = dto.params.connection;
      var worker = dto.params.worker;
      ipcSendMessage(
        { channel: channel, connection: connection, type: 'close' },
        worker
      );
      resp.send('Deletado');
    }, 'httpControllers/httpController.js/KILL SPECIFIC CONNECTION');
  }
);
/**
 *                             KILL SPECIFIC CHANNEL                                  .
 *ENG:
 *Sends a message to the master so it can broadcast a message to all processes to kill that
 *channel if they have it.
 *PT:
 *Manda uma mensagem para o master para que este possa reenviar no  "all" o comando
 * de matar este cannal em todos os processos
 */
httpController.delete('/delete/:token', (dto, resp) => {
  tryToWithLogger(() => {
    var channel = dto.params.token;
    process.send({
      command: 'kill channel',
      channel: channel,
    });
    resp.send('deletado');
  }, 'httpControllers/httpController.js/KILL SPECIFIC CHANNEL');
});

module.exports = { httpController };
