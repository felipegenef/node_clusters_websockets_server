const express = require('express');
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const { dealWithBroadCast } = require('./ipcFunctions/oneToMany');
const { connectToIPCS } = require('./ipcFunctions/oneToOne');
const { httpController } = require('./HttpControllers/httpController');
const { workersList } = require('./globalVariables/dynamicRepository');
const webSOcketServer = new WebSocket.Server({ server: server });
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const { ipcServerStart } = require('./ipcServer/ipcServe');
const { startWebsocketServer } = require('./websocketServer/websocketServer');
const Shared = require('mmap-object');
const workerId = new Shared.Create('./globalVariables/workers');
const { listenToBroadCast } = require('./ipcFunctions/oneToMany');
const colors = require('colors/safe');
const { wellcome } = require('./wellcome');
/**
 *
 *
 *                                SCALABLE WEBSOCKET SERVER EXAMPLE            .
 * ENG:
 *This server will scale as much as you need. It detects the number of cpus in
 *your cluster and  make the best out of what you have. It send messages between
 *the processes with IPC so every process knows the global state of the
 *application. When receiving a message it resend it to all processes that are
 *logged in the subject that the connection sender is on. When receiving a message from
 *other process it share it with all the websocketconnections of that channel.
 *
 * PT:
 * Este servidor irá escalar conforme houver necessidade. Ele detecta o número
 * de cpus no seu cluster e se adapta da melhor forma possivel. Ele manda
 * mensagens entre os processos criados com uma comunicação IPC para que cada
 * processo saiba o estado global da aplicação. Quando receber uma mensagem ,
 * ele irá reenviar esta para todos os processos logados no canal em que a
 * conexão de envio está. Quando receber uma mensagem de outro processo ,
 * ele ira enviar para suas conexões websocket do respectivo canal.
 *
 *
 *
 *
 * by:Felipe Gené de Faria
 *
 *
 *
 */

/**
 *                                            MASTER                           .
 *
 *
 * ENG:
 * This is the master process. It administrates all the other server instances
 * (other processes).
 * PT:
 * Este é o processo mestre. Ele administra todas as outras instancias do
 * servidor(os outros processos).
 */
if (cluster.isMaster) {
  wellcome();
  const workers = [];
  console.log(
    colors.magenta('Master'),
    'running on',
    '[',
    colors.green(`${process.pid}`),
    ']'
  );
  for (var i = 0; i < numCPUs; i++) {
    let slave = cluster.fork();
    workerId[`${i}`] = slave.process.pid;
    workers.push(slave);
  }
  workers.forEach((worker) => {
    dealWithBroadCast(worker, workers);
  });
} else {
  /**
   *
   *
   *
   *
   *                                  Workers                                  .
   *
   *
   *
   *
   *ENG:
   *This is the defaul instance of the server. All processes will be
   *just like this one, but will be independent and share information with
   *their IPC connections. We can see the IPC connection beeing set below and
   *the id of the connection beiing the same as the Process PID.
   *PT:
   *Esta é a instancia padrão do servidor. Todos os processos irão ser exatamente
   *como esse, mas serão independentes e compartilharão informações utilizando a
   *comunicação IPC. Podemos ver as conexões IPC sendo setadas abaixo , com seu
   *id sendo equivalente ao id do seu processo, seu PID.
   */

  /**
   *                                 IPC SERVER                                .
   */
  ipcServerStart();
  /**
   *                                 DYNAMIC IPC ID HANDLER                    .
   * ENG:
   * Creates the channels for IPC connections.
   * PT:
   * Cria canais de conexão IPC.
   */
  for (var i = 0; i < numCPUs; i++) {
    workersList.push(workerId[`${i}`].toString());
  }
  workersList.forEach((worker) => {
    connectToIPCS(worker);
  });
  /**
   *                                IPC PUBLIC MESSAGE LISTENER               .
   */
  listenToBroadCast();
  /**
   *                                HTTP SERVER CONTROLLERS                   .
   */
  app.use(httpController);
  /**
   *                                WEBSOCKET SERVER                          .
   */
  startWebsocketServer(webSOcketServer);
  /**
   *                                 NODE SERVER                              .
   */

  server.listen(8080, () =>
    console.log(
      colors.magenta('Worker'),
      '[',
      colors.green(`${process.pid}`),
      ']',
      'listenning on port',
      colors.yellow('8080')
    )
  );
}
