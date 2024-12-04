/** @param {RoomObject} o **/
function enterablePositionsAround(o) {
  let count = 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x - 1, o.pos.y - 1)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x - 1, o.pos.y)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x - 1, o.pos.y + 1)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x, o.pos.y - 1)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x, o.pos.y + 1)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x + 1, o.pos.y - 1)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x + 1, o.pos.y)) ? 1 : 0;
  count += isEnterable(o.room.getPositionAt(o.pos.x + 1, o.pos.y + 1)) ? 1 : 0;
  return count;
}

/** @param {RoomPosition} pos **/
function isEnterable(pos) {
  const atPos = pos.look();
  const SWAMP = 'swamp';
  const PLAIN = 'plain';
  for (let i = 0; i < atPos.length; i++) {
    switch (atPos[i].type) {
      case LOOK_TERRAIN:
        if (atPos[i].terrain != PLAIN && atPos[i].terrain != SWAMP) return false;
        break;
      case LOOK_STRUCTURES:
        if (OBSTACLE_OBJECT_TYPES.includes(atPos[i].structure.structureType)) return false;
        break;
      case LOOK_CREEPS:
      case LOOK_SOURCES:
      case LOOK_MINERALS:
      case LOOK_NUKES:
      case LOOK_ENERGY:
      case LOOK_RESOURCES:
      case LOOK_FLAGS:
      case LOOK_CONSTRUCTION_SITES:
      default:
    }
  }
  return true;
}

/** @param {Creep} creep **/
function closestEnergyStructure(creep) {
  const structures = creep.room
    .find(FIND_STRUCTURES, {
      filter: (structure) => {
        const prevActions = global.actions.filter(
          ([_, action]) => action.type == 'withdrawEnergy' && action.target == structure.id
        );

        const prevAccumulator = prevActions.reduce((acc, [creep, _]) => {
          return acc + creep.store.getFreeCapacity(RESOURCE_ENERGY);
        }, 0);

        return canWithdrawEnergy(structure) && prevAccumulator < structure.store[RESOURCE_ENERGY];
      },
    })
    .sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
  if (structures.length == 0) {
    return null;
  } else {
    return structures[0];
  }
}

function findClosestInMyRooms(creep, type, opts) {
  const targets = [];
  for (let room of Object.values(global.rooms)) {
    targets.push(...room.find(type, opts));
  }
  if (targets.length == 0) {
    return null;
  }
  targets.sort(
    (a, b) =>
      creep.pos.getRangeTo(a) +
      (creep.room === a.room ? 0 : 1000) -
      (creep.pos.getRangeTo(b) + (creep.room === b.room ? 0 : 1000))
  );
  return targets[0];
}

/** @param {Structure} structure **/
function canStoreEnergy(structure) {
  if (
    structure.structureType == STRUCTURE_CONTAINER &&
    structure.room.controller.my &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  ) {
    return true;
  }
  return (
    (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
    structure.my &&
    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  );
}

/** @param {Structure} structure **/
function canWithdrawEnergy(structure) {
  if (
    structure.structureType == STRUCTURE_CONTAINER &&
    structure.room.controller.my &&
    structure.store[RESOURCE_ENERGY] > 0
  ) {
    return true;
  }
  return (
    (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
    structure.my &&
    structure.store[RESOURCE_ENERGY] > 0
  );
}

module.exports = {
  enterablePositionsAround,
  isEnterable,
  closestEnergyStructure,
  findClosestInMyRooms,
  canStoreEnergy,
  canWithdrawEnergy,
};
