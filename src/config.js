const ROLES_CONFIG = {
  harvester: {
    count: 15,
    body: [WORK, CARRY, MOVE, WORK, CARRY, MOVE],
    priority: 99,
  },
  upgrader: {
    count: 3,
    body: [WORK, CARRY, MOVE, WORK, CARRY, MOVE],
    priority: 90,
  },
  builder: {
    count: 6,
    body: [WORK, CARRY, MOVE, WORK, CARRY, MOVE],
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
  transporter: {
    count: 3,
    body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE],
    priority: 90,
  },
};

// creeps will harvest at these rooms in order
const HARVEST_AT = ['E54S18', 'E54S19', 'E54S17'];

module.exports = { ROLES_CONFIG, HARVEST_AT };
