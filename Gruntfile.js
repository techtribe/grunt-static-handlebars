/*
 * static-handlebars
 * https://github.com/techtribe/grunt-static-handlebars
 *
 * Copyright (c) 2013 Joey van Dijk
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'test/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    staticHandlebars: {
        options:{
            partials:'test/fixtures/partials/**/*.hbp',
            helpers:'test/fixtures/helpers/**/*.js'
        },
        usePartials:{
            options:{
                helpers:[]
            },
            files:{
                'tmp/usePartials/*.html':'test/fixtures/homepage/*.hbt'
            }
        },
        useHelpers:{
            options:{
                partials:[]
            },
            files:{
                'tmp/useHelpers/*.html':'test/fixtures/help/*.hbt'
            }
        },
        usePartialsAndHelpers:{
            files:{
                'tmp/usePartialsAndHelpers/*.html':'test/fixtures/homepage/*.hbt'
            }
        },
        renderFixedTemplate:{
            files:{
                'tmp/renderFixedTemplate/index.html':'test/fixtures/homepage/index.hbt'
            }
        },
        renderFixedTemplateWithOtherContext:{
            options:{
                json:'test/fixtures/homepage/different.json'
            },
            files:{
                'tmp/renderFixedTemplateWithOtherContext/index.html':'test/fixtures/homepage/index.hbt'
            }
        },
        renderPlainHtml:{
            files:{
                'tmp/renderPlainHtml/*.html':'test/fixtures/plainHtml/*.html'
            }
        },
        renderTemplateDirectory:{
            files:{
                'tmp/renderTemplateDirectory/*.html':'test/fixtures/faq/*.hbt'
            }
        },
        renderDeepTemplateDirectory:{
            files:[
                {'tmp/renderDeepTemplateDirectory/products/**/*.html':'test/fixtures/products/**/*.hbt'}
            ]
        },
        renderMultiTemplates:{
            files:[
                {'tmp/renderMultiTemplates/sub1/**/*.html':'test/fixtures/faq/**/*.hbt'},
                {'tmp/renderMultiTemplates/sub2/**/*.html':'test/fixtures/faq/**/*.hbt'}
            ]
        },
        renderInclude:{
            files:{'tmp/renderInclude/*.html':'test/fixtures/campaign/*.hbt'}
        }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'staticHandlebars', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
