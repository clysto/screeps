const roleBuilder = require('role.builder');
const { bestSource } = require('utils');

var roleHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.room.energyAvailable >= creep.room.energyCapacityAvailable) {
      roleBuilder.run(creep);
      return;
    }

    if (creep.store.getFreeCapacity() > 0) {
      var source = bestSource(creep);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    } else {
      var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  },
};

module.exports = roleHarvester;
