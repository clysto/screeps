const { bestSource } = require('utils');

const roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.building === undefined) {
      creep.memory.building = true;
    }

    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say('Harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say('Build');
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (!targets.length) {
        if (creep.room.name != 'E54S18') {
          creep.moveTo(new RoomPosition(16, 4, 'E54S18'), { visualizePathStyle: { stroke: '#9900ff' } });
          return;
        } else {
          creep.moveTo(new RoomPosition(20, 20, 'E54S17'), { visualizePathStyle: { stroke: '#9900ff' } });
          return;
        }
      }

      targets.sort((t1, t2) => {
        const priority = {
          STRUCTURE_EXTENSION: 3,
          STRUCTURE_SPAWN: 2,
          STRUCTURE_CONTAINER: 1,
        };
        const p1 = priority[t1.structureType] || 99;
        const p2 = priority[t2.structureType] || 99;
        if (p1 !== p2) {
          return p1 - p2;
        } else {
          const d1 = creep.pos.getRangeTo(t1);
          const d2 = creep.pos.getRangeTo(t2);
          return d1 - d2;
        }
      });
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
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

module.exports = roleBuilder;
