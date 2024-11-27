const roleRepairer = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // 切换状态：从修理状态转为获取能量
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
      creep.say('Harvest');
    }
    // 切换状态：从获取能量状态转为修理状态
    if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
      creep.say('Repair');
    }

    if (creep.memory.repairing) {
      // 查找需要修理的建筑
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax,
      });

      if (targets.length) {
        // 优先修理耐久度较低的建筑
        targets.sort((a, b) => a.hits - b.hits);

        if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        // 如果没有需要修理的建筑，移动到旗帜或空闲区域
        const flag = Game.flags['IdleFlag']; // 可选：设置一个旗帜标记
        if (flag) {
          creep.moveTo(flag, { visualizePathStyle: { stroke: '#ffaa00' } });
        } else {
          creep.say('Idle');
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

module.exports = roleRepairer;
