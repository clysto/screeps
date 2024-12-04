require('dotenv').config();

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    screeps: {
      options: {
        email: 'maoyachen55@gmail.com',
        token: process.env['SCREEPS_TOKEN'],
        branch: 'beta',
        ptr: !!process.env['PTR'],
      },
      dist: {
        src: ['src/*.js'],
      },
    },
  });
};
