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
    harvester: {
      E54S17: 0,
      E54S18: 0,
    },
    builder: 0,
    upgrader: 0,
  };

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      creepsCount[creep.memory.role][creep.memory.harvestRoom]++;
    } else {
      creepsCount[creep.memory.role]++;
    }
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
    if (role == 'harvester') {
      for (let room in creepsCount[role]) {
        if (creepsCount[role][room] < 5) {
          let ret = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE, WORK, CARRY, MOVE], Game.time, {
            memory: { role: role, harvestRoom: room },
          });
          if (ret == OK) {
            console.log(`Spawn a ${role} who harvests in ${room}`);
          }
        }
      }
      continue;
    }

    if (creepsCount[role] < 5) {
      let ret = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE, WORK, CARRY, MOVE], Game.time, {
        memory: { role: role },
      });
      if (ret == OK) {
        console.log(`Spawn a ${role}`);
      }
    }
  }
};
