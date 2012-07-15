/*global module:false */
module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    meta: {
      banner: '/*! Meemoo.js - v1 - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://meemoo.org/\n' +
        '* https://github.com/meemoo/meemoo/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> Forrest Oliphant;' +
        ' Licensed MIT, AGPL \n' +
        '*/'
    },
    min: {
      dist: {
        src: [          
          '<banner:meta.banner>',
          'v1/meemoo.js'
        ],
        dest: 'v1/meemoo-min.js'
      }
    },
    lint: {
      files: ['grunt.js', 'v1/meemoo.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    jshint: {
      options: {
        forin:true, 
        noarg:true, 
        noempty:true, 
        eqeqeq:true, 
        bitwise:true, 
        strict:true, 
        undef:true, 
        curly:true, 
        browser:true, 
        devel:true, 
        indent:2, 
        maxerr:50
      },
      globals: {
        "console": true
      }
    }

  });
  // Default task.
  grunt.registerTask('default', 'lint min');

};