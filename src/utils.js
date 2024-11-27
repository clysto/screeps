/** @param {Creep} creep **/
function bestSource(creep) {
  const sources = creep.room.find(FIND_SOURCES);
  sources.sort((s1, s2) => {
    let enterable1 = enterablePositionsAround(s1);
    let enterable2 = enterablePositionsAround(s2);
    let d1 = creep.pos.getRangeTo(s1);
    let d2 = creep.pos.getRangeTo(s2);

    const c1 = d1 <= 1 ? -10000 : d1 - enterable1 * 15;
    const c2 = d2 <= 1 ? -10000 : d2 - enterable2 * 15;

    return c1 - c2;
  });
  if (sources.length) {
    return sources[0];
  } else {
    return null;
  }
}

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
        return false;
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

/**
 * 计算从指定 structure 或 source 取能量的代价
 * @param {Creep} creep
 * @param {Structure | Source} target
 * @returns {number} 代价
 */
function calculateEnergyCost(creep, target) {
  let cost = 0;

  // 距离代价
  const distance = creep.pos.getRangeTo(target);
  cost += distance;

  // 判断目标类型
  if (target instanceof Source) {
    // 如果是能量源
    const harvestPositions = target.pos.findInRange(FIND_MY_CREEPS, 1, {
      filter: (c) => c.memory.harvesting && c.memory.target === target.id,
    }).length;

    const maxHarvesters = target.pos.findInRange(FIND_CREEPS, 1).length;

    // 采集点竞争代价
    if (harvestPositions >= maxHarvesters) {
      cost += 10; // 过多人时增加额外代价
    }

    // 剩余能量影响代价
    const energyAvailability = target.energy / target.energyCapacity;
    cost += (1 - energyAvailability) * 10; // 能量越少，代价越高
  } else if (target instanceof Structure) {
    // 如果是扩展或生成点等
    if (
      target.structureType === STRUCTURE_EXTENSION ||
      target.structureType === STRUCTURE_SPAWN ||
      target.structureType === STRUCTURE_CONTAINER ||
      target.structureType === STRUCTURE_STORAGE
    ) {
      const energyAvailable = target.store[RESOURCE_ENERGY];
      const energyCapacity = target.store.getCapacity(RESOURCE_ENERGY);

      // 剩余能量比例
      const energyAvailability = energyAvailable / energyCapacity;
      cost += (1 - energyAvailability) * 10; // 能量越少，代价越高

      // 检查是否有人正在取能量
      const waitingCreeps = target.pos.findInRange(FIND_MY_CREEPS, 1, {
        filter: (c) => c.memory.withdrawing && c.memory.target === target.id,
      }).length;

      if (waitingCreeps > 0) {
        cost += 5 * waitingCreeps; // 每个等待者增加额外代价
      }
    }
  } else {
    // 如果目标不是 source 或 structure，返回极高代价
    return Infinity;
  }

  return cost;
}

module.exports = {
  bestSource,
  isEnterable,
  enterablePositionsAround,
};
