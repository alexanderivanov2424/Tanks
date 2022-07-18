import { useState, useEffect } from 'react';

import {
  ClientGameStateContext,
  useOwner,
  useLobby,
  useGameState,
} from './context_hooks.js';

import { Player as MPlayer, Bag } from './server/common/model.js';
import { socket } from './socket.js';

import {} from './server/common/helpers.js';

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
            case 'players':
              for (const name in value) {
                value[name] = new MPlayer(value[name]);
              }
              return value;
            case 'wallet':
            case 'items':
            case 'pot':
              return new Bag(value);
            default:
              return value;
          }
        })
      );
    });
  }, []);

  if (state === null) {
    return null;
  }

  const {} = state;

  return null;
}
