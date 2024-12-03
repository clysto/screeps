const { enterablePositionsAround, closestEnergyStructure } = require('utils');

const harvester = {
  harvestersAtSource: function (source) {
    return global.actions.filter(([_, action]) => {
      return action.type == 'harvestSource' && action.target == source.id;
    }).length;
  },

  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store.getFreeCapacity() > 0) {
      const source = creep.pos.findClosestByPath(FIND_SOURCES, {
        filter: (source) => {
          let count = harvester.harvestersAtSource(source);
          return enterablePositionsAround(source) > count;
        },
      });
      if (source) {
        return { type: 'harvestSource', target: source.id };
      } else {
        return { type: 'idle', reason: 'no sources' };
      }
    } else {
      const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_CONTAINER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });
      if (structure) {
        return { type: 'transferEnergy', target: structure.id };
      } else {
        return { type: 'idle', reason: 'no structures' };
      }
    }
  },
};

const upgrader = {
  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      const structure = closestEnergyStructure(creep);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return { type: 'idle' };
      }
    } else {
      const controller = creep.room.controller;
      return { type: 'upgradeController', target: controller.id };
    }
  },
};

const builder = {
  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      const structure = closestEnergyStructure(creep);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return { type: 'idle', reason: 'no energy' };
      }
    } else {
      const constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
      if (constructionSite) {
        return { type: 'buildStructure', target: constructionSite.id };
      } else {
        return { type: 'idle', reason: 'no construction sites' };
      }
    }
  },
};

const repairer = {
  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      const structure = closestEnergyStructure(creep);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return { type: 'idle' };
      }
    } else {
      const structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return structure.hits < structure.hitsMax;
        },
      });
      if (structure) {
        return { type: 'repairStructure', target: structure.id };
      } else {
        return { type: 'idle' };
      }
    }
  },
};

module.exports = { harvester, upgrader, builder, repairer };
