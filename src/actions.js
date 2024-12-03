//*********************** CREEP ACTIONS ***********************//

/** @param {Creep} creep **/
function idle(creep) {
  creep.say('💤');
  if (creep.memory.action.reason) {
    console.log(`${creep.who()} is idle because ${creep.memory.action.reason}`);
  }
  // random move
  creep.move(Math.floor(Math.random() * 8) + 1);
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
  if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
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
  if (creep.build(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
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
  if (creep.repair(target) == ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
  }
  if (creep.store[RESOURCE_ENERGY] == 0) {
    // action stop
    creep.memory.action = undefined;
  }
}

/** @param {Creep} creep **/
function moveToRoom(creep) {
  const target = new RoomPosition(25, 25, creep.memory.action.target);
  if (creep.room.name != creep.memory.action.target) {
    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
  }
}

//*********************** GLOBAL ACTIONS ***********************//
function spawnCreep(action) {
  let { role, body, spawn } = action;
  const name = Game.time;
  spawn = Game.spawns[spawn];
  spawn.spawnCreep(body, name, {
    memory: { role: role },
  });
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
};
