function toggleLog() {
  Memory.log = !!!Memory.log;
  return 0;
}

function roles() {
  for (let role of Object.keys(global.rolesCount)) {
    console.log(`${role}: ${global.rolesCount[role]}`);
  }
  return 0;
}

module.exports = {
  toggleLog,
  roles,
};
