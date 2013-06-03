/*
 * grunt-static-handlebars
 * https://github.com/techtribe/grunt-static-handlebars
 *
 * Copyright (c) 2013 Joey van Dijk
 * Licensed under the MIT license.
 */

'use strict';

//TODO ALL references to itself need to be switched = memory leak

//TODO helpersPath / partialsPath optional (simyo = ../name default)

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
        usePartials:{
            options:{
                assets:{
                    partialPath:'test/fixtures/partials/*.hbp'
                }
            },
            files:{
                'tmp/usePartials/*.html':'test/fixtures/homepage/*.hbt'
            }
        },
        useHelpers:{
            options:{
                assets:{
                    helperPath:'test/fixtures/helpers'
                }
            },
            files:{
                'tmp/useHelpers/*.html':'test/fixtures/help/*.hbt'
            }
        },
        usePartialsAndHelpers:{
            options:{
                assets:{
                    partialPath:'test/fixtures/partials/*.hbp',
                    helperPath:'test/fixtures/helpers'
                }
            },
            files:{
                'tmp/usePartialsAndHelpers/*.html':'test/fixtures/homepage/*.hbt'
            }
        },
        renderFixedTemplate:{
            options:{
                assets:{
                    partialPath:'test/fixtures/partials/*.hbp',
                    helperPath:'test/fixtures/helpers'
                }
            },
            files:{
                'tmp/renderFixedTemplate/index.html':'test/fixtures/homepage/index.hbt'
            }
        },
        renderFixedTemplateWithOtherContext:{
            options:{
                assets:{
                    partialPath:'test/fixtures/partials/*.hbp',
                    helperPath:'test/fixtures/helpers'
                },
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
            options:{
                assets:{
                    partialPath:'test/fixtures/partials/*.hbp',
                    helperPath:'test/fixtures/helpers'
                }
            },
            files:{'tmp/renderInclude/*.html':'test/fixtures/campaign/*.hbt'}
        },
        renderIgnore:{
            files:{'tmp/renderIgnore/*.html':'test/fixtures/ignore/*.html'}
        },
        renderComplex:{
            options:{
                assets:{
                    sourcesPath: 'test/assets', //used for JS/CSS files
                    packagedFilesPath: 'tmp/packages',
                    assetsPath: '/',
                    partialPath:'test/fixtures/partials/*.hbp',
                    helperPath:'test/fixtures/helpers'
                }
            },
            files:{'tmp/renderComplex/**/*.html':'test/fixtures/complex/**/*.hbt'}
        },
        renderComplexWithoutPackages:{
            options:{
                assets:{
                    sourcesPath: 'test/assets', //used for JS/CSS files but now skip concatenating files
                    assetsPath: '/',
                    partialPath:'test/fixtures/partials/*.hbp',
                    helperPath:'test/fixtures/helpers'
                }
            },
            files:{'tmp/renderComplexWithoutPackages/**/*.html':'test/fixtures/complex/**/*.hbt'}
        },
        renderSourceView:{
            options:{
                assets:{
                    sourcesPath: 'test/fixtures/sourceView/', //used for JS/CSS files but now skip concatenating files
                    assetsPath: 'test/fixtures/sourceView/assets',
                    partialPath:'test/fixtures/sourceView/handlebars/partials/*.html',
                    helperPath:'test/fixtures/sourceView/handlebars/helpers'
                },
                sourceView:true
            },
            files:{'tmp/renderSourceView/**/*.html':'test/fixtures/sourceView/handlebars/templates/**/*.html'}
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
