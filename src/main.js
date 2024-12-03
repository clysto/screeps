const ALL_ACTIONS = require('actions');
const ALL_ROLES = require('roles');

Creep.prototype.who = function () {
  return `Creep ${this.name} (${this.memory.role})`;
};

Creep.prototype.nextAction = function () {
  return ALL_ROLES[this.memory.role].nextAction(this);
};

Creep.prototype.do = function (action) {
  this.memory.action = action;
  return ALL_ACTIONS[action.type](this);
};

function globalDo(action) {
  return ALL_ACTIONS[action.type](action);
}

module.exports.loop = function () {
  // Global informations
  global.actions = [];
  global.rolesCount = {};
  global.rooms = {};
  for (let spawn of Object.values(Game.spawns)) {
    global.rooms[spawn.room.name] = spawn.room;
  }

  const busyCreeps = Object.values(Game.creeps).filter((creep) => creep.memory.action);
  const freeCreeps = Object.values(Game.creeps).filter((creep) => !creep.memory.action);

  console.log('Free creeps: ', freeCreeps.length);

  for (let creep of busyCreeps) {
    // Continue with the current action for all busy creeps
    global.actions.push([creep, creep.memory.action]);
    global.rolesCount[creep.memory.role] = (global.rolesCount[creep.memory.role] || 0) + 1;
    if (!global.rooms[creep.room.name]) {
      global.rooms[creep.room.name] = creep.room;
    }
  }

  for (let creep of freeCreeps) {
    // Generate actions for all free creeps by their role
    const action = creep.nextAction();
    if (action.type !== 'idle') {
      console.log(`${creep.who()} wants do ${action.type}`);
    }
    global.actions.push([creep, action]);
    global.rolesCount[creep.memory.role] = (global.rolesCount[creep.memory.role] || 0) + 1;
    if (!global.rooms[creep.room.name]) {
      global.rooms[creep.room.name] = creep.room;
    }
  }

  // Generate global actions
  for (let role of Object.keys(ALL_ROLES)) {
    const count = global.rolesCount[role] || 0;
    if (count < 5) {
      global.actions.push([
        null,
        { type: 'spawnCreep', role: role, body: [WORK, CARRY, MOVE], spawn: 'Spawn1', priority: 10 },
      ]);
    }
  }

  // Schedule all actions by priority
  // global.actions.sort(([_, actionA], [_, actionB]) => (actionB.priority || 1) - (actionA.priority || 1));
  for (let [creep, action] of global.actions) {
    if (creep) {
      // creep action
      creep.do(action);
    } else {
      // global action
      globalDo(action);
    }
  }

  // Clear memory
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
};
