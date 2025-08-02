# CloudFlare Workers Based MUD 

I'm starting from the workers chat example as it was in reading about this that 
I even got the idea. Here that example uses separate chat rooms, I'm thinking 
that is where we will define the map locations. I need to fully wrap my mind 
around how the chat app works first, but I'm just going to sketch out the idea 
in my head here. 

# World Definition 
**Set of files**:
`universe.json`: defines the main infomation about the game 'universe', 
```
'into-text': link to a markdown file with text about the world... a story introduction (locale string may be appended to filename for internationalization support)

'roll-prompts': link to a json file with all the user prompts for character creation (locale string as above)

'classes': array of classes characters can choose from, should store attribute 
modifiers, and descriptions.

'race': similar to classes, you - look into how these differ in traditional muds/tabletop

'guild': not chosen at roll, but which of 'vampire', 'thief', etc your character is, some may be mutually exclusive, permanent, that will be left to the code for these

'attributes': array of attributes and their possible values

'equip-locations': array of places where items may be equipped and which types where. ('head':{'type':'armor'},'body'{'type':'armor'},'lefthand':{'type':'weapon'}, 'righthand':{'type':'weapon'} } etc...

'appearance': object describing character's phys features. 

'profile': list of profile fields, can store functional stuff like which gang you're in. 


```
## description of the game maps... each of these down to region will have their own file, describing the characteristics of each, position relative to eachother etc. Universe.json will contain a complete enumeration of these files, or at least the directories where to find them. whichever works, we're going to see about getting AI to generate all of this. Of course they may be edited manually, but, definitely supplemented by AI

'worlds': an object of with 5 levels depth 
    'world' => 'think of this like a planet, by default this is fixed, but I want to leave this open for waaayy future extension possibilities, 
       'realm' => 'think of this like a continent, again this will be fixed for the forseeable future', '
           'land' => 'this will be where most of the content takes place, most muds you've played have stayed within a single one of these.,
              'region' => 'this is a greater play area, an (x,y,z) coordinate grid, like the dark cultist forest, the first town, the road between the towns, etc' this is what you see when you run `map` command by default,
                  'room' => 'the smallest unit of movement in the game, each one of these has exits possible in 10 directions any of which may be [hidden] or [locked]  n, ne, e, se s, sw, w, nw, up, down. A description of the surroundings, and an array of items, or containers holding items which may also be [hidden] or [locked], a list of bots in the room, and a range of bot difficulty levels, and max to minimum number of them per room.  

```

The chat app uses websockets, so interaction all happens in real time. this should make for very interesting play. Further, if we program the characteristics of the players and the areas to follow some sort of structure, it will likely be possible to build a program in godot to read the text interaction going on behind the scenes and convert to at least rudimentary graphical play displayed in html5canvas.  

Whatever the case may be the main game logic is standard dungeon rpg, fight enemeies, get exp/gold, buy weapons, armor, spells, level your player, gather loot, sell loot, become overencumbered, learn skills, learn magic, become vampire, werewolf, maybe program some random neurodivergence into the characters, variables/probabilities, calculate results, etc. 

With the chatroom stuff, you can interact with other players, so its the chatroom becomes location bases, and the MUD logic is going on in addition to it. Just like any of those old bbs games. Simple stuff. This should be fun and relatively easy to put together... famous last words, right. :)

