import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface Item {
  name: string;
  description: string;
}

export interface NPC {
  name: string;
  description: string;
  stats: Record<string, number>;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  exits: Record<string, string>;
  items?: string[];
  npcs?: string[];
}

export interface Region {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Land {
  regions: Record<string, Region>;
}

export interface Realm {
  lands: Record<string, Land>;
}

export interface World {
  realms: Record<string, Realm>;
}

export interface Universe {
  introText: string;
  rollPrompts: { prompt: string }[];
  items: Record<string, Item>;
  npcs: Record<string, NPC>;
  worlds: Record<string, World>;
}

async function loadJson<T>(filePath: string): Promise<T> {
  const data = await readFile(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

async function loadRegion(baseDir: string, regionRef: { file: string }): Promise<Region> {
  const filePath = path.join(baseDir, regionRef.file);
  return loadJson<Region>(filePath);
}

export async function loadUniverse(baseDir = 'data'): Promise<Universe> {
  const universe = await loadJson<any>(path.join(baseDir, 'universe.json'));

  const [items, npcs, rollPrompts, introText] = await Promise.all([
    loadJson<Record<string, Item>>(path.join(baseDir, 'items.json')),
    loadJson<Record<string, NPC>>(path.join(baseDir, 'npcs.json')),
    loadJson<{ prompt: string }[]>(path.join(baseDir, 'roll-prompts.json')),
    readFile(path.join('.', universe.introText), 'utf-8').catch(() => '')
  ]);

  for (const world of Object.values(universe.worlds as Record<string, any>)) {
    for (const realm of Object.values(world.realms as Record<string, any>)) {
      for (const land of Object.values(realm.lands as Record<string, any>)) {
        for (const [key, regionRef] of Object.entries(land.regions as Record<string, any>)) {
          if (regionRef && typeof regionRef === 'object' && 'file' in regionRef) {
            land.regions[key] = await loadRegion(baseDir, regionRef);
          }
        }
      }
    }
  }

  return { ...universe, items, npcs, rollPrompts, introText } as Universe;
}

