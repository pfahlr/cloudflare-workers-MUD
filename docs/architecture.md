# MUD Architecture Overview

## Entity Modeling
- **Rooms** are the basic units of navigation. Each room contains a description, exits to adjacent rooms, items lying around, and non-player characters (NPCs).
- **Exits** are directional links (`north`, `south`, etc.) mapping to other room identifiers. Hidden or locked properties can be added later.
- **Items** are defined separately and referenced by identifier. Items may be placed in rooms or carried by players and NPCs.
- **NPCs** describe interactive actors with statistics and behaviors. Rooms list the IDs of NPCs present.

## Hierarchical World Structure
The world is described in nested layers:
`universe` → `world` → `realm` → `land` → `region` → `room`.

The prototype data files show this relationship:
- `data/universe.json` points to the `beginner_forest` region file.
- `data/worlds/earth/realms/gaia/lands/greenfield/regions/beginner_forest.json` defines two rooms, their exits, and the items/NPCs they contain.
- Supporting definitions live in `data/items.json` and `data/npcs.json`.

## State Persistence Options
- **Durable Objects** can maintain authoritative state for players or rooms, enabling consistent real-time interactions.
- **KV Storage** is useful for relatively static data such as world definitions or for snapshotting character progress. Periodic writes or message passing from Durable Objects can keep KV synchronized.

Combining the two allows fast reads of world data from KV while using Durable Objects for mutable state.

## Front-End Visualization Possibilities
- **HTML5 Canvas**: render text output, simple tile maps, or minimal graphics by consuming the JSON world data and WebSocket events.
- **Godot Integration**: a Godot client can connect to the Worker WebSocket, parse the same data files, and provide richer visualization or 2D/3D representations while retaining the text-based gameplay options.
