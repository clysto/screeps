const { bestSource } = require('utils');

const roleUpgrader = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say('harvest');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
      creep.memory.upgrading = true;
      creep.say('upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      const energyStorage = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.store[RESOURCE_ENERGY] > 0 &&
            structure.my
          );
        },
      });

      energyStorage.sort((s1, s2) => {
        return s2.store[RESOURCE_ENERGY] - s1.store[RESOURCE_ENERGY];
      });

      if (energyStorage.length) {
        const target = energyStorage[0];
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      } else {
        const source = bestSource(creep);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  },
};

module.exports = roleUpgrader;
