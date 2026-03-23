import { Weapon } from './Weapon';
import { Whipblade } from './Whipblade';
import { VoidOrbs } from './VoidOrbs';
import { PlasmaLance } from './PlasmaLance';
import { NovaBlast } from './NovaBlast';
import { ChainLightning } from './ChainLightning';
import { DroneSwarm } from './DroneSwarm';

export const WEAPON_DEFS: Record<string, { name: string; description: string; create: () => Weapon }> = {
  whipblade: {
    name: 'Whipblade',
    description: 'Slashes a wide arc in your facing direction',
    create: () => new Whipblade(),
  },
  voidOrbs: {
    name: 'Void Orbs',
    description: 'Orbs orbit you, damaging enemies on contact',
    create: () => new VoidOrbs(),
  },
  plasmaLance: {
    name: 'Plasma Lance',
    description: 'Fires a bolt at the nearest enemy',
    create: () => new PlasmaLance(),
  },
  novaBlast: {
    name: 'Nova Blast',
    description: 'Explosive shockwave around you',
    create: () => new NovaBlast(),
  },
  chainLightning: {
    name: 'Chain Lightning',
    description: 'Zaps the nearest enemy and chains to others',
    create: () => new ChainLightning(),
  },
  droneSwarm: {
    name: 'Drone Swarm',
    description: 'Deploys autonomous drones that hunt enemies',
    create: () => new DroneSwarm(),
  },
};

export function createWeapon(id: string): Weapon {
  const def = WEAPON_DEFS[id];
  if (!def) throw new Error(`Unknown weapon: ${id}`);
  return def.create();
}

export const ALL_WEAPON_IDS = Object.keys(WEAPON_DEFS);
