/**
 *                             GLOBAL VARIABLES                                  .
 */
const chats = {};
const connections = {};
const globalState = {};
const workersList = [];
const connectionsCount = {
  number: 0,
};
module.exports = {
  chats,
  connections,
  workersList,
  globalState,
  connectionsCount,
};
