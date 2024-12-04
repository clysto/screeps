const {
  enterablePositionsAround,
  whereToWithdraw: whereToWithdraw,
  findClosestInMyRooms,
  canStoreEnergy,
} = require('utils');

const { HARVEST_AT } = require('config');

const harvester = {
  harvestersAtSource: function (source) {
    return global.actions.filter(([_, action]) => {
      return action.type == 'harvestSource' && action.target == source.id;
    }).length;
  },

  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store.getFreeCapacity() > 0) {
      // If we already harvested from a source, prefer to keep harvesting from it
      if (creep.memory._harvestSourceId) {
        const source = Game.getObjectById(creep.memory._harvestSourceId);
        if (source && harvester.harvestersAtSource(source) < enterablePositionsAround(source)) {
          return { type: 'harvestSource', target: source.id };
        }
      }
      const source = findClosestInMyRooms(creep, FIND_SOURCES_ACTIVE, {
        filter: (source) => {
          let count = harvester.harvestersAtSource(source);
          return enterablePositionsAround(source) > count;
        },
      });
      if (source) {
        creep.memory._harvestSourceId = source.id;
        return { type: 'harvestSource', target: source.id };
      } else {
        // find a room to harvest
        const harvestRooms = HARVEST_AT.filter((roomName) => !global.rooms[roomName]);
        if (harvestRooms.length > 0) {
          delete creep.memory._harvestSourceId;
          return { type: 'moveToRoom', target: harvestRooms[0] };
        } else {
          return { type: 'idle', reason: 'no rooms to harvest' };
        }
      }
    } else {
      const structure = findClosestInMyRooms(creep, FIND_STRUCTURES, {
        filter: (structure) => {
          return canStoreEnergy(structure);
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
      const structure = whereToWithdraw(creep);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return { type: 'idle', reason: 'no energy' };
      }
    } else {
      const controller = findClosestInMyRooms(creep, FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType == STRUCTURE_CONTROLLER;
        },
      });
      return { type: 'upgradeController', target: controller.id };
    }
  },
};

const builder = {
  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      const structure = whereToWithdraw(creep);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return harvester.nextAction(creep);
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
      const structure = whereToWithdraw(creep);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return harvester.nextAction(creep);
      }
    } else {
      const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.my ||
              structure.structureType == STRUCTURE_ROAD ||
              structure.structureType == STRUCTURE_CONTAINER) &&
            structure.hits < structure.hitsMax * 0.8
          );
        },
      });
      if (structure) {
        return { type: 'repairStructure', target: structure.id };
      } else {
        return { type: 'idle', reason: 'no structures to repair' };
      }
    }
  },
};

const soldier = {
  /** @param {Creep} creep **/
  nextAction: function (creep) {
    const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (target) {
      return { type: 'attack', target: target.id };
    } else {
      // patrol in a random room
      const roomNames = Object.keys(global.rooms);
      const roomName = roomNames[Math.floor(Math.random() * roomNames.length)];
      return { type: 'moveToRoom', target: roomName };
    }
  },
};

const transporter = {
  /** @param {Creep} creep **/
  nextAction: function (creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) {
      const structure = whereToWithdraw(creep, (structure) => structure.structureType == STRUCTURE_CONTAINER);
      if (structure) {
        return { type: 'withdrawEnergy', target: structure.id };
      } else {
        return harvester.nextAction(creep);
      }
    } else {
      const structure = findClosestInMyRooms(creep, FIND_STRUCTURES, {
        filter: (structure) => {
          return canStoreEnergy(structure) && structure.structureType != STRUCTURE_CONTAINER;
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

module.exports = { harvester, upgrader, builder, repairer, soldier, transporter };
