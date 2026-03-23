import { Weapon } from './Weapon';
import { Whipblade } from './Whipblade';
import { VoidOrbs } from './VoidOrbs';
import { PlasmaLance } from './PlasmaLance';
import { NovaBlast } from './NovaBlast';
import { ChainLightning } from './ChainLightning';
import { DroneSwarm } from './DroneSwarm';

interface WeaponDef {
  name: string;
  description: string;
  create: () => Weapon;
}

export const WEAPON_DEFS: Record<string, WeaponDef> = {
  whipblade: {
    name: 'Whipblade',
    description: 'Slashes enemies in an arc in front of you.',
    create: () => new Whipblade(),
  },
  void_orbs: {
    name: 'Void Orbs',
    description: 'Orbiting energy spheres that damage nearby enemies.',
    create: () => new VoidOrbs(),
  },
  plasma_lance: {
    name: 'Plasma Lance',
    description: 'Fires piercing projectiles at the nearest enemy.',
    create: () => new PlasmaLance(),
  },
  nova_blast: {
    name: 'Nova Blast',
    description: 'Releases a devastating explosion around you.',
    create: () => new NovaBlast(),
  },
  chain_lightning: {
    name: 'Chain Lightning',
    description: 'Lightning that arcs between nearby enemies.',
    create: () => new ChainLightning(),
  },
  drone_swarm: {
    name: 'Drone Swarm',
    description: 'Autonomous drones that seek and attack enemies.',
    create: () => new DroneSwarm(),
  },
};

export const ALL_WEAPON_IDS: string[] = Object.keys(WEAPON_DEFS);

export function createWeapon(id: string): Weapon {
  const def = WEAPON_DEFS[id];
  if (!def) throw new Error(`Unknown weapon ID: ${id}`);
  return def.create();
}
