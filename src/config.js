const ROLES_CONFIG = {
  harvester: {
    count: 11,
    priority: 99,
  },
  upgrader: {
    count: 3,
    priority: 90,
  },
  builder: {
    count: 6,
    priority: 80,
  },
  repairer: {
    count: 5,
    priority: 70,
  },
  soldier: {
    count: 2,
    body: [ATTACK, ATTACK, MOVE, MOVE],
    priority: 100,
  },
};

const HARVEST_AT = ['E54S18', 'E54S19'];
