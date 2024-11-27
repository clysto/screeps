const roleHarvester = require('role.harvester');
const roleBuilder = require('role.builder');
const roleUpgrader = require('role.upgrader');
const roleRepairer = require('role.repairer');

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
      E54S19: 0,
    },
    upgrader: 0,
    builder: 0,
    repairer: 0,
  };

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      creepsCount[creep.memory.role][creep.memory.harvestRoom]++;
    } else {
      creepsCount[creep.memory.role]++;
    }

    if (creep.memory.originalRole) {
      if (creep.memory.timeToSwitchRole <= 0) {
        creep.memory.role = creep.memory.originalRole;
        creep.memory.originalRole = undefined;
      } else {
        creep.memory.timeToSwitchRole--;
      }
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
    if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
  }

  for (let role in creepsCount) {
    if (role == 'harvester') {
      for (let room in creepsCount[role]) {
        if (creepsCount[role][room] < 3) {
          let ret = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE], Game.time, {
            memory: { role: role, harvestRoom: room },
          });
          if (ret == OK) {
            console.log(`Spawn a ${role} who harvests in ${room}`);
          }
        }
      }
      continue;
    }

    if (creepsCount[role] < 4) {
      let ret = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE], Game.time, {
        memory: { role: role },
      });
      if (ret == OK) {
        console.log(`Spawn a ${role}`);
      }
    }
  }
};
