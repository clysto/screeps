const roleHarvester = require('role.harvester');
const roleBuilder = require('role.builder');
const roleUpgrader = require('role.upgrader');

module.exports.loop = function () {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  const creepsCount = {
    harvester: 0,
    builder: 0,
    upgrader: 0,
  };

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    creepsCount[creep.memory.role]++;
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
  }

  for (let role in creepsCount) {
    if (creepsCount[role] < 5) {
      let ret = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE], Game.time, {
        memory: { role: role },
      });
      if (ret == OK) {
        console.log(`Spawn a ${role}`);
      }
    }
  }
};
