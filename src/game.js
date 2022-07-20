import { useState, useEffect } from 'react';

import {
  ClientGameStateContext,
  useOwner,
  useLobby,
  useGameState,
} from './context_hooks.js';

import { Board as MBoard } from './server/common/model.js';
import { socket } from './socket.js';

import {} from './server/common/helpers.js';

var DO_NOT_USE_ME_STATE = {
  turn: 'Ahoth',
  board: new MBoard(10, 10),
  players: {
    Bob: {
      hp: 3,
      location: [4, 2],
    },
    Ahoth: {
      hp: 3,
      location: [-1, -1],
    },
    Belth: {
      hp: 3,
      location: [-1, -1],
    },
    'Limbo Lauren': {
      hp: 3,
      location: [-1, -1],
    },
  },
};

function Board({ board }) {
  return null;
}

function Player(name, hp) {
  return <div class="player">{`${name}: ${hp} HP`}</div>;
}

function Players({ players }) {
  return (
    <div class="player-box">
      {Object.entries(players).map((name, data) => {
        return <Player name={name} hp={data.hp} />;
      })}
    </div>
  );
}

function Actions() {
  //TODO would be sick if we had an object for the actions, a list of action objects in the client, and automatically build the action box
  // based on the data in the action objects (is available, is your turn, etc)
  return null;
}

export default function GameScreen() {
  const owner = useOwner();
  const lobby = useLobby();
  const [state, setState] = useState(null);

  useEffect(() => {
    // TODO: top level await before rendering?
    socket.on('game.update.state', (data) => {
      setState(
        JSON.parse(data, (key, value) => {
          switch (key) {
            case 'board':
              return MBoard(value);
            default:
              return value;
          }
        })
      );
    });

    // Client update calls
    socket.on('game.turn.move', (player) => {});
    socket.on('game.turn.scan', (player, region, hits) => {});
    socket.on('game.turn.scatter', (player, region) => {});
    socket.on('game.turn.shot', (player, region) => {});

    /*
    TODO:
    Abilities / actions
    ########################
    Ghost: walk through walls


    Patch Notes:
    p1: nerf characters we don't like


    Add Music to game (ask Rahul to compose)
    */
  }, []);

  if (state === null) {
    return null;
  }

  const { turn, board, players } = state;

  return (
    <div>
      <Board board={board} />
      <Players players={players} />
      <Actions />
    </div>
  );
}
