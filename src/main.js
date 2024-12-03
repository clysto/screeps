const ALL_ACTIONS = require('actions');
const ALL_ROLES = require('roles');

Creep.prototype.who = function () {
  return `Creep ${this.name} (${this.memory.role})`;
};

Creep.prototype.nextAction = function () {
  return ALL_ROLES[this.memory.role].nextAction(this);
};

Creep.prototype.do = function (action) {
  if (action.type === 'idle') {
    this.memory.idleTime = (this.memory.idleTime || 0) + 1;
  } else {
    delete this.memory.idleTime;
  }
  this.memory.action = action;
  ALL_ACTIONS[action.type](this);

  if (this.memory.originRole) {
    this.memory.timeToOriginRole -= 1;
    if (this.memory.timeToOriginRole <= 0) {
      this.memory.role = this.memory.originRole;
      delete this.memory.originRole;
      delete this.memory.timeToOriginRole;
      return;
    }
  }

  if (this.memory.idleTime > 10) {
    this.memory.originRole = this.memory.role;
    this.memory.timeToOriginRole = 100;
    this.memory.role = 'harvester';
  }
};

function globalDo(action) {
  ALL_ACTIONS[action.type](action);
}

const BALANCED_ROLES = {
  harvester: 10,
  upgrader: 3,
  builder: 5,
  repairer: 5,
};

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

  for (let creep of busyCreeps) {
    // Continue with the current action for all busy creeps
    global.actions.push([creep, creep.memory.action]);
    global.rolesCount[creep.memory.originRole || creep.memory.role] =
      (global.rolesCount[creep.memory.originRole || creep.memory.role] || 0) + 1;
    if (!global.rooms[creep.room.name]) {
      global.rooms[creep.room.name] = creep.room;
    }
  }

  for (let creep of freeCreeps) {
    // Generate actions for all free creeps by their role
    const action = creep.nextAction();
    // if (action.type !== 'idle') {
    //   console.log(`${creep.who()} wants do ${action.type}`);
    // }
    global.actions.push([creep, action]);
    global.rolesCount[creep.memory.originRole || creep.memory.role] =
      (global.rolesCount[creep.memory.originRole || creep.memory.role] || 0) + 1;
    if (!global.rooms[creep.room.name]) {
      global.rooms[creep.room.name] = creep.room;
    }
  }

  // Generate global actions
  for (let role of Object.keys(BALANCED_ROLES)) {
    const count = global.rolesCount[role] || 0;
    if (count < BALANCED_ROLES[role]) {
      global.actions.push([
        null,
        { type: 'spawnCreep', role: role, body: [WORK, CARRY, MOVE], spawn: 'Spawn1', priority: 100 - count },
      ]);
      console.log(`Spawning ${role}`);
    }
  }

  // Schedule all actions by priority
  global.actions.sort((a, b) => {
    return (b[1].priority || 1) - (a[1].priority || 1);
  });
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

  // Stats
  if (Game.time % 10 == 0) {
    for (let role of Object.keys(global.rolesCount)) {
      console.log(`${role}: ${global.rolesCount[role]}`);
    }
  }
};
