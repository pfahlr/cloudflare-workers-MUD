import { Universe, Room } from './universe.js';

export interface PlayerState {
  roomId: string;
  inventory: string[];
  roomItems: Record<string, string[]>; // remaining items per room for this player
}

function getRoom(universe: Universe, roomId: string): Room {
  const region = universe.worlds.earth.realms.gaia.lands.greenfield.regions.beginner_forest;
  const room = region.rooms.find(r => r.id === roomId);
  if (!room) throw new Error(`Unknown room ${roomId}`);
  return room;
}

export function describeRoom(universe: Universe, state: PlayerState): string {
  const room = getRoom(universe, state.roomId);
  const lines = [room.title, room.description];
  const items = state.roomItems[state.roomId] ?? room.items ?? [];
  if (items.length) {
    lines.push('Items: ' + items.join(', '));
  }
  const exits = Object.keys(room.exits).join(', ');
  lines.push('Exits: ' + exits);
  return lines.join('\n');
}

export function handleCommand(universe: Universe, state: PlayerState, input: string): [string, PlayerState] {
  const [command, ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(' ');
  switch (command.toLowerCase()) {
    case 'look': {
      return [describeRoom(universe, state), state];
    }
    case 'move': {
      const dir = arg.toLowerCase();
      const room = getRoom(universe, state.roomId);
      const next = room.exits[dir];
      if (!next) return [`You can't go ${dir}.`, state];
      const newState = { ...state, roomId: next };
      // Initialize items for room if first visit
      if (!newState.roomItems[next]) {
        const nextRoom = getRoom(universe, next);
        newState.roomItems[next] = [...(nextRoom.items ?? [])];
      }
      return [describeRoom(universe, newState), newState];
    }
    case 'inventory': {
      if (state.inventory.length === 0) return ['Inventory is empty.', state];
      return ['Inventory: ' + state.inventory.join(', '), state];
    }
    case 'take': {
      const item = arg.toLowerCase();
      const items = state.roomItems[state.roomId] ?? [];
      const idx = items.indexOf(item);
      if (idx === -1) return [`No ${item} here.`, state];
      const newItems = [...items];
      newItems.splice(idx, 1);
      const newState = {
        ...state,
        inventory: [...state.inventory, item],
        roomItems: { ...state.roomItems, [state.roomId]: newItems }
      };
      return [`You take the ${item}.`, newState];
    }
    case 'drop': {
      const item = arg.toLowerCase();
      const idx = state.inventory.indexOf(item);
      if (idx === -1) return [`You don't have ${item}.`, state];
      const newInv = [...state.inventory];
      newInv.splice(idx, 1);
      const roomInv = state.roomItems[state.roomId] ?? [];
      const newRoomItems = [...roomInv, item];
      const newState = {
        ...state,
        inventory: newInv,
        roomItems: { ...state.roomItems, [state.roomId]: newRoomItems }
      };
      return [`You drop the ${item}.`, newState];
    }
    default:
      return [`Unknown command: ${command}`, state];
  }
}

export function initialState(universe: Universe): PlayerState {
  const startRoom = universe.worlds.earth.realms.gaia.lands.greenfield.regions.beginner_forest.rooms[0];
  return {
    roomId: startRoom.id,
    inventory: [],
    roomItems: { [startRoom.id]: [...(startRoom.items ?? [])] }
  };
}
