const ALL_ACTIONS = require('actions');
const ALL_ROLES = require('roles');
const ALL_COMMANDS = require('commands');
const { ROLES_CONFIG } = require('config');
const { log } = require('utils');

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

  if (this.memory.role === 'soldier') {
    return;
  }

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

function exec(cmd, ...args) {
  return ALL_COMMANDS[cmd](args);
}

module.exports.loop = function () {
  // Global informations
  global.exec = exec;
  global.actions = [];
  global.rolesCount = {};
  global.rooms = {};
  // Store only live for one tick
  global.store = {};
  for (let spawn of Object.values(Game.spawns)) {
    global.rooms[spawn.room.name] = spawn.room;
  }
  for (let creep of Object.values(Game.creeps)) {
    global.rooms[creep.room.name] = creep.room;
  }

  log(`===================== Tick ${Game.time} =====================`);
  log(`${Object.keys(Game.creeps).length} creeps in ${Object.keys(global.rooms).length} rooms`);

  const busyCreeps = Object.values(Game.creeps).filter((creep) => creep.memory.action);
  const freeCreeps = Object.values(Game.creeps).filter((creep) => !creep.memory.action);

  for (let creep of busyCreeps) {
    // Continue with the current action for all busy creeps
    global.actions.push([creep, creep.memory.action]);
    global.rolesCount[creep.memory.originRole || creep.memory.role] =
      (global.rolesCount[creep.memory.originRole || creep.memory.role] || 0) + 1;
  }

  for (let creep of freeCreeps) {
    // Generate actions for all free creeps by their role
    const action = creep.nextAction();
    global.actions.push([creep, action]);
    global.rolesCount[creep.memory.originRole || creep.memory.role] =
      (global.rolesCount[creep.memory.originRole || creep.memory.role] || 0) + 1;
  }
  log(`${freeCreeps.length} actions for ${freeCreeps.length} creeps has been generated`);

  // Generate global actions
  for (let role of Object.keys(ROLES_CONFIG)) {
    const count = global.rolesCount[role] || 0;
    if (count < ROLES_CONFIG[role].count) {
      global.actions.push([
        null,
        {
          type: 'spawnCreep',
          role: role,
          body: ROLES_CONFIG[role].body || [WORK, CARRY, MOVE],
          spawn: 'Spawn1',
          priority: ROLES_CONFIG[role].priority,
        },
      ]);
      log(`Spawning ${role}`);
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
      log('Clearing non-existing creep memory:', name);
    }
  }
};
