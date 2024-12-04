const { log } = require('utils');

//*********************** CREEP ACTIONS ***********************//

/** @param {Creep} creep **/
function idle(creep) {
  creep.say('💤');
  if (creep.memory.action.reason) {
    log(`${creep.who()} is idle because ${creep.memory.action.reason}`);
  }

  const flag = creep.pos.findClosestByPath(FIND_FLAGS, {
    filter: (flag) => {
      return flag.name.startsWith('idle');
    },
  });

  if (flag && creep.pos.getRangeTo(flag) > 3) {
    creep.moveTo(flag, { visualizePathStyle: { stroke: '#000000' } });
  }

  if (creep.memory.action.idleTicks == undefined) {
    creep.memory.action = undefined;
  } else {
    creep.memory.action.idleTicks -= 1;
    if (creep.memory.action.idleTicks <= 0) {
      creep.memory.action = undefined;
    }
  }
}

/** @param {Creep} creep **/
function harvestSource(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  if (!target) {
    creep.memory.action = undefined;
  }

  const status = creep.harvest(target);
  if (status == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
  } else if (status != OK) {
    // action stop
    creep.memory.action = undefined;
  }
  if (creep.store.getFreeCapacity() == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function transferEnergy(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  const status = creep.transfer(target, RESOURCE_ENERGY);
  if (status == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
  }
  if (status == ERR_FULL || creep.store[RESOURCE_ENERGY] == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function moveTo(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  if (creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } }) == ERR_NO_PATH) {
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function buildStructure(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  const status = creep.build(target);
  if (status == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
  } else if (status != OK) {
    // action stop
    creep.memory.action = undefined;
  }
  if (creep.store[RESOURCE_ENERGY] == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function withdrawEnergy(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  if (!target || target.store[RESOURCE_ENERGY] == 0) {
    // action stop
    creep.memory.action = undefined;
    return;
  }
  if (global.store._stopWithdraw && global.store._stopWithdraw[target.room.name] && creep.role !== 'transporter') {
    creep.say('🛑');
    creep.memory.action = undefined;
    return;
  }
  const status = creep.withdraw(target, RESOURCE_ENERGY);
  if (status == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
  }
  if (status == ERR_NOT_ENOUGH_RESOURCES || creep.store.getFreeCapacity() == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function upgradeController(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  if (creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
  }
  if (creep.store[RESOURCE_ENERGY] == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function repairStructure(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  const status = creep.repair(target);
  if (status == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#00ff00' } });
  } else if (status != OK) {
    // action stop
    creep.memory.action = undefined;
  }
  if (creep.store[RESOURCE_ENERGY] == 0 || target.hits == target.hitsMax) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function moveToRoom(creep) {
  if (!creep.memory.action.target) {
    // action stop
    creep.memory.action = undefined;
    return;
  }
  const target = new RoomPosition(25, 25, creep.memory.action.target);
  if (creep.room.name != creep.memory.action.target) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#800080' } });
  } else {
    // action stop
    creep.memory.action = undefined;
  }
}

function attack(creep) {
  const target = Game.getObjectById(creep.memory.action.target);
  if (creep.attack(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
  }
  if (target.hits == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

//*********************** GLOBAL ACTIONS ***********************//
function spawnCreep(action) {
  let { role, body, spawn } = action;
  const name = Game.time;
  spawn = Game.spawns[spawn];
  const status = spawn.spawnCreep(body, name, {
    memory: { role: role },
  });
  if (status == ERR_NOT_ENOUGH_ENERGY) {
    if (!global.store._stopWithdraw) {
      global.store._stopWithdraw = {};
    }
    global.store._stopWithdraw[spawn.room.name] = true;
  }
}

module.exports = {
  harvestSource,
  transferEnergy,
  idle,
  upgradeController,
  moveTo,
  withdrawEnergy,
  buildStructure,
  repairStructure,
  spawnCreep,
  moveToRoom,
  attack,
};
