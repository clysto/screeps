/** @param {Creep} creep **/
function bestSource(creep) {
  const sources = creep.room.find(FIND_SOURCES);
  sources.sort((s1, s2) => {
    let enterable1 = enterablePositionsAround(s1);
    let enterable2 = enterablePositionsAround(s2);

    const c1 = creep.pos.getRangeTo(s1) - enterable1 * 15;
    const c2 = creep.pos.getRangeTo(s2) - enterable2 * 15;

    return c1 - c2;
  });
  if (sources.length) {
    return sources[0];
  } else {
    return null;
  }
}

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

function isEnterable(pos) {
  var atPos = pos.look();
  var SWAMP = 'swamp';
  var PLAIN = 'plain';
  for (var i = 0; i < atPos.length; i++) {
    switch (atPos[i].type) {
      case LOOK_TERRAIN:
        if (atPos[i].terrain != PLAIN && atPos[i].terrain != SWAMP) return false;
        break;
      case LOOK_STRUCTURES:
        if (OBSTACLE_OBJECT_TYPES.includes(atPos[i].structure.structureType)) return false;
        break;
      case LOOK_CREEPS:
        return false;
        break;
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

module.exports = {
  bestSource,
  isEnterable,
  enterablePositionsAround,
};
