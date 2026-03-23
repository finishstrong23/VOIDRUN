export interface WeaponLevelDesc {
  weaponId: string;
  name: string;
  icon: string;
  levels: string[];
}

export const WEAPON_LEVEL_DESCS: WeaponLevelDesc[] = [
  {
    weaponId: 'whipblade', name: 'Whipblade', icon: 'sword',
    levels: [
      'Lv2: +33% damage',
      'Lv3: 150\u00B0 arc',
      'Lv4: +30% range',
      'Lv5: 360\u00B0 full circle',
    ],
  },
  {
    weaponId: 'voidOrbs', name: 'Void Orbs', icon: 'orb',
    levels: [
      'Lv2: +1 orb',
      'Lv3: +25% damage',
      'Lv4: +1 orb',
      'Lv5: Orbs pierce',
    ],
  },
  {
    weaponId: 'plasmaLance', name: 'Plasma Lance', icon: 'bolt',
    levels: [
      'Lv2: +30% damage',
      'Lv3: Pierce 2 enemies',
      'Lv4: -20% cooldown',
      'Lv5: Chain lightning',
    ],
  },
  {
    weaponId: 'novaField', name: 'Nova Field', icon: 'nova',
    levels: [
      'Lv2: +25% radius',
      'Lv3: +40% damage',
      'Lv4: Slows enemies',
      'Lv5: Double pulse',
    ],
  },
  {
    weaponId: 'seekerDrones', name: 'Seeker Drones', icon: 'drone',
    levels: [
      'Lv2: +1 drone',
      'Lv3: +30% damage',
      'Lv4: +1 drone',
      'Lv5: Drones explode',
    ],
  },
  {
    weaponId: 'voidRift', name: 'Void Rift', icon: 'rift',
    levels: [
      'Lv2: +40% size',
      'Lv3: +25% damage',
      'Lv4: Pulls enemies',
      'Lv5: +1 rift',
    ],
  },
];
