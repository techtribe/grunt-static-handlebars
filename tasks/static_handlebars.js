/*
 * static-handlebars
 * https://github.com/techtribe/grunt-static-handlebars
 *
 * Copyright (c) 2013 Joey van Dijk
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    var _ = require('lodash');
    var Test100 = {};

    grunt.file.defaultEncoding = 'utf8';

    function getBasename(filename){
        var s = filename.split('/');
        var output = '';
        if(s.length > 0){
            s = s.pop();
            if(s.length > 0){
                output = s.split('.');
                if(output.length > 0){
                    output = output[0];
                }else{
                    reference.errors.push({file:filename,error:'Invalid syntax of filename: no extension provided'});
                }
            }else{
                reference.errors.push({file:filename,error:'Invalid syntax of filename: no file provided'});
            }
        }else{
            reference.errors.push({file:filename,error:'Invalid syntax of filename: no path provided ("/")'});
        }
        return output;
    }

    function getOutputFilename(filename,input){
        var glob = isGlob(filename);
        var output = '';
        if(glob != undefined){
            var extension = filename.split('.');
            //TODO never possible?
            if(glob.charAt(glob.length-1) === '/'){
                output = glob+getBasename(input)+'.'+extension[1];
            }else{
                output = glob+getBasename(input)+'/.'+extension[1];
            }
        }else{
            //just a file
            output= filename;
        }
        return output;
    }

    function isGlob(filename) {
        var match = filename.match(/[^\*]*/);
        if (match[0] !== filename) return match.pop();
    }

    function getRegexName(matches,type){
        //TODO {{# ?
        //find unique names of handlebars-identifiers being used
        var list = [];
        //TODO while loop faster?
        matches.forEach(function(handlebar){
            var result;
            if(type === TYPE_PARTIAL){
                result = new RegExp(/\{{2}\>\s(\w+)/).exec(handlebar);
            }else if(type === TYPE_HELPER){
                result = new RegExp(/\{{2}(\w+)/).exec(handlebar);
            }else{
                //TODO do nothing?
            }
            if(result != null && result[1] != undefined){
                if(result.index === 0){
                    //ignore {{{ markup
                    list.push(result[1]);
                }
            }
        });
        list = _.uniq(list);
        //builtin helpers are used with {{# so do not need to be "rejected"
        return list;
    }

    function sourceDirectory(data,task){
        if(data){
            if(!_.isArray(data)){
                var s = [data];
                data = s.splice(0, s.length);
            }
            var p = [];
            _.each(data,function(item){
                var values = _.values(item);
                if(values.length > 1){
                    grunt.fail.fatal(new Error('Too many "files"-values given at task "'+task+'" : '+require('util').inspect(values).toString()));
                }
                var directory = values[0];
                if(directory.indexOf('**') !== -1){
                    //fill subdirectories
                    var s = directory.split('**');
                    s.pop();
                    p.push(s[0]);
                }else{
                    //no subdirectories
                }
                //check keys/values if they match in depth (**/* cannot match *.hbt in input/output folders)
                _.forIn(item,function(value,key){
                    if(value.indexOf('**') !== -1){
                        if(key.indexOf('**') === -1){
                            grunt.fail.fatal('Destination ('+key+') needs to have the same depth as the input file ('+value+')');
                        }
                    }else if(key.indexOf('**') !== -1){
                        grunt.fail.fatal('Destination ('+key+') needs to have the same depth as the input file ('+value+')');
                    }
                });
            });
            data = null;
            return _.uniq(p);
        }else{
            data = null;
            return [];
        }
    }

    function replaceExtension(filename,extension){
        return filename.substr(0,filename.lastIndexOf('.'))+'.'+extension;
    }

    function destinationPath(destination,filepath,subDirectories){
        //find subdirectory
        var path ;
        if(subDirectories.length === 0){
            //same path, no deep folders
            if(destination.indexOf('*') === -1){
                path = destination;
            }else{
                var s = destination.split('*').shift();
                path = s + filepath.split('/').pop();
            }
        }else{
            //subdirectories found, so determine how deep a file needs to be brought
            var found = _.find(subDirectories,function(item){
                if(filepath.indexOf(item) !== -1){
                    return true;
                }else{
                    return false;
                }
            });
            var s = destination.split('*').shift();
            path = s + filepath.replace(found,'');
        }
        return replaceExtension(path,destination.split('.').pop());
    }

    function isContext(name,context){
        //check if variable is found in context file (JSON)
        return _.has(context,name);
    }

    var NAME = 'staticHandlebars';
    var TYPE_PARTIAL = 0;
    var TYPE_HELPER = 1;
    var handlebarsRegex = /\{\{([\s\S]+?)\}\}/g;
    var reference = {
        partials:{},
        helpers:{},
        errors:[]
    };
    var files;
    //load all partials
    files = grunt.file.expand(grunt.config.get(NAME).options.partials);
    files.forEach(function(file){
        reference.partials[getBasename(file)] = grunt.file.read(file);
    });

    //load all helpers
    files = grunt.file.expand(grunt.config.get(NAME).options.helpers);
    files.forEach(function(file){
        var s = require('./../'+file);
        reference.helpers[getBasename(file)] = s;
    });
    files = null;

    //register task
    grunt.registerMultiTask(NAME, 'Create static html from handlebars-files.', function() {
        var handlebars = require('handlebars');
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            skipRendering:false,
            useSameFilename:true,
            subDirectories:[]
        });

        //check if template-data has the same basename
        if(options.json){
            options.useSameFilename = false;
        }

        //check if helpers or partials are overruled
        if(_.isEmpty(options.helpers)){
            options.disableHelpers = true;
        }else{
            options.disableHelpers = false;
        }
        if(_.isEmpty(options.partials)){
            options.disablePartials = true;
        }else{
            options.disablePartials = false;
        }

        if(typeof options.json === "string"){
            options.json = [options.json];
        }

        //TODO ALL references to itself need to be switched = memory leak
        //retrieve base folders to copy correctly into destination folders
        options.subDirectories = sourceDirectory(this.data.files,this.target);

        grunt.log.write('Rendering "'+this.target+'" ...');

        // Iterate over all specified file groups.
        var errors = [];
        var i = 0;
        this.files.forEach(function(f) {
            //loop through all files to render
            f.src.filter(function(filepath) {
                //input
                var file = grunt.file.read(filepath);
                var output = '';
                var hbs = file.match(handlebarsRegex);
                //detect if handlebars or just plain html
                if(hbs === null){
                    //just a html file, no handlebars
                    grunt.file.write(getOutputFilename(f.dest,filepath),file);
                }else{
                    //get context data to use with handlebars templates
                    var context = '';
                    //TODO JSON.parse works, but grunt.file.readJSON not
                    var jsonFile;
                    try{
                        //if file not exist, grunt will pop up an error
                        if(options.useSameFilename){
                            jsonFile = filepath.substr(0,filepath.lastIndexOf('.')) + '.json';
                        }else{
                            //another json file provided
                            jsonFile = options.json[i];
                        }
                        context = JSON.parse(grunt.file.read(jsonFile,{encoding:'utf8'}));
                    }catch(e){
                        grunt.log.write('\n');
                        if(e instanceof SyntaxError){
                            grunt.fail.fatal('Your JSON file ('+jsonFile+') has no valid syntax',e);
                        }else if(e.origError.errno === 34){
                            //no json file found
                            grunt.fail.fatal(new Error('No context file (like '+ e.origError.path+') provided at '+filepath+' . See documentation for more information.'));
                        }else{
                            grunt.fail.fatal(e);
                        }
                    }

                    //determine which helpers/partials are needed for this file to speedup compilation
                    var list;
                    if(!options.disablePartials){
                        list = getRegexName(hbs,TYPE_PARTIAL);
                        _.each(list,function(item){
                            var isCntxt = isContext(item,context);
                            if(reference.partials[item] != undefined && !isCntxt){
                                handlebars.registerPartial(item,reference.partials[item]);
                            }else if(reference.partials[item] === undefined && isCntxt){
                                //ignore, while it is a context parameter
                            }else{
                                var err = new Error('Partial "'+item+'" cannot be found.',item);
                                errors.push({type:'partial',file:filepath,context:item,error:err});
                                grunt.fail.warn(err);
                            }
                        });
                    }
                    if(!options.disableHelpers){
                        list = getRegexName(hbs,TYPE_HELPER);
                        _.each(list,function(item){
                            var isCntxt = isContext(item,context);
                            if(reference.helpers[item] != undefined && !isCntxt){
                                //add handlebars as this.handlebars to prevent nodejs code inside helpers
                                handlebars.registerHelper(item,function helperWrapper(context,options){
                                    var args = Array.prototype.slice.call(arguments);
                                    args.unshift(this);
                                    this.Handlebars = handlebars;
                                    return reference.helpers[item].apply(this,args);
                                });
                            }else if(reference.helpers[item] === undefined && isCntxt){
                                //ignore, while it is a context parameter
                            }else{
                                var err = new Error('Helper function "'+item+'" cannot be found.',item);
                                errors.push({type:'helper',file:filepath,context:item,error:err});
                                grunt.fail.warn(err);
                            }
                        });
                    }

                    try{
                        //ignore errors with used helpers/partials
                        if(errors.length === 0){
                            //compile
                            var template = handlebars.compile(file);
                            output = template(context);
                        }
                    }catch(e){
                        errors.push({type:'compile',file:filepath,context:context ? '' : context.substr(0,100),error:e});
                        grunt.fail.fatal(e);
                    }

                    //determine output path
                    var path = destinationPath(f.dest,filepath,options.subDirectories);

                    //save
                    grunt.file.write(path,output);
                }
            });
            i++;
        });
        //succeeded
        grunt.log.ok();

        if(errors.length > 0){
            grunt.log.error('\n##### ERRORS #####');
            //if any errors, post them
            _.each(errors,function(item){
                grunt.log.errorlns(item.file,'-',item.message);
            });
            grunt.fail.fatal(new Error('Compile errors, see above'));
        }

        //cleanup / free memory
        handlebars = null;
        options = null;
  });
};
