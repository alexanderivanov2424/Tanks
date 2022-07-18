import { createServer } from 'http';

import express from 'express';
import session from 'express-session';
import { Server } from 'socket.io';
import { serialize, parse } from 'cookie';

import { DEBUG } from './common/helpers.js';

import { STACK_SIZE } from './common/settings.js';

import { Player } from './common/model.js';

const app = express();
const server = createServer(app);

const sessionMiddleware = session({
  secret: 'dontcare', //TODO different secret on each startup
  resave: false,
  saveUninitialized: false,
});

// -------------- Express Middleware --------------

app.use(sessionMiddleware);

// -------------- Server State --------------------

const sessionIdToUsername = new Map();
const usernameToSessionId = new Map();

var lobby = [];

// -------------- Game State --------------------
var GAME_STARTED = false;

var state = null;

function resetGame() {}

function InitGameState(lobby) {
  GAME_STARTED = true;
  // players
  // each player has location and health
  //
}

function ProgressTurn() {}

// TODO: GAME LOGIC AND EVENTS

// -------------- Socket.IO Events ----------------

const io = new Server(server, {
  path: '/socket',
});

io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

function lobbyOnConnect(socket, username, gameOnConnect) {
  if (!lobby.includes(username)) {
    lobby.push(username);
    io.emit('lobby.update.lobby_list', lobby);
  }

  socket.emit('lobby.update.client_username', username);

  socket.on('lobby.join', () => {
    if (!lobby.includes(username)) {
      lobby.push(username);
      io.emit('lobby.update.lobby_list', lobby);
    }
  });

  async function sendGameState() {
    for (const socket of await io.fetchSockets()) {
      socket.emit('game.update.state', JSON.stringify(state));
    }
  }

  socket.on('lobby.start_game', async () => {
    const host = lobby[0];
    if (username === host) {
      io.emit('game_started');
      InitGameState(lobby);
      setInterval(sendGameState, 100);
      for (const socket of await io.fetchSockets()) {
        gameOnConnect(socket, socket.username);
      }
    }
  });
}

function gameOnConnect(socket, username) {
  if (!lobby.includes(username)) {
    console.warn(`${username} could not join game because it already started`);
    return;
  }

  const thisPlayer = state.players[username];

  thisPlayer.status = STATUS_ONLINE;
  socket.on('disconnect', () => {
    thisPlayer.status = STATUS_OFFLINE;
  });

  // TODO: Game Socket Events

  // socket.on('game.action.target', (targetPlayerName, item) => {
  //   Event_Target(targetPlayerName, item);
  // });
}

io.on('connection', (socket) => {
  const req = socket.request;
  const sessionId = req.session.id;

  function onConnect(username) {
    socket.username = username;

    console.log(`${username} connected`);
    socket.on('disconnect', () => {
      console.log(`${username} disconnected`);
    });

    socket.onAny((event, ...args) => {
      console.log(event, username + ':', args);
    });

    if (!GAME_STARTED) {
      lobbyOnConnect(socket, username, gameOnConnect);
    } else {
      gameOnConnect(socket, username);
    }
  }

  socket.on('login.submit', (username) => {
    // check if username is unique
    if (!usernameToSessionId.has(username)) {
      sessionIdToUsername.set(sessionId, username);
      usernameToSessionId.set(username, sessionId);
      socket.emit('login.success', username);
      onConnect(username);
      console.log('Logged In');
    } else {
      socket.emit('login.username_taken');
    }
  });

  socket.on('game.reconnect', (username) => {
    if (!lobby.includes(username)) {
      socket.emit('client.reset');
    } else if (
      state === null ||
      state.players[username].status === STATUS_OFFLINE
    ) {
      onConnect(username);
      console.log('Reconnected');
    }
  });
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});
