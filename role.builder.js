const { bestSource } = require('utils');

var roleBuilder = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      targets.sort((t1, t2) => {
        const priority = {
          STRUCTURE_EXTENSION: 1,
          STRUCTURE_SPAWN: 2,
          STRUCTURE_TOWER: 3,
        };
        const p1 = priority[t1.structureType] || 99;
        const p2 = priority[t2.structureType] || 99;
        if (p1 !== p2) {
          return p1 - p2; // 优先级高的放前面
        } else {
          const d1 = creep.pos.getRangeTo(t1);
          const d2 = creep.pos.getRangeTo(t2);
          return d1 - d2; // 如果优先级相同，按距离排序
        }
      });
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    } else {
      var source = bestSource(creep);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  },
};

module.exports = roleBuilder;
