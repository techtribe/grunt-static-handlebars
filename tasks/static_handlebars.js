/*
 * static-handlebars
 * https://github.com/techtribe/grunt-static-handlebars
 *
 * Copyright (c) 2013 Joey van Dijk
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    var md5 = require('MD5');

    //ensure Handlebars can be used inside partials/helpers
    var GLOBAL_OBJECT = GLOBAL;
    if(GLOBAL_OBJECT.Handlebars){
        GLOBAL_OBJECT.Handlebars = null;
    }
    GLOBAL_OBJECT.Handlebars = require('handlebars');
    GLOBAL_OBJECT._ = grunt.util._;
    GLOBAL_OBJECT.grunt = grunt;
    //local
    var handlebars = GLOBAL_OBJECT.Handlebars;

    //variables
    var NAME = 'staticHandlebars';
    var handlebarsRegex = /\{\{([\s\S]+?)\}\}/g;
    var reference = {
        partials:{},
        helpers:{},
        errors:[]
    };
    var files;

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

    function sourceDirectory(data,task){
        if(data){
            if(!grunt.util._.isArray(data)){
                var s = [data];
                data = s.splice(0, s.length);
            }
            var p = [];
            grunt.util._.each(data,function(item){
                var values = grunt.util._.values(item);
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
                grunt.util._.forIn(item,function(value,key){
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
            return grunt.util._.uniq(p);
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
        var path, destinationBasePath;
        if(subDirectories.length === 0){
            //same path, no deep folders
            if(destination.indexOf('*') === -1){
                path = destination;
            }else{
                destinationBasePath = destination.split('*').shift();
                path = destinationBasePath + filepath.split('/').pop();
            }
        }else{
            //subdirectories found, so determine how deep a file needs to be brought
            var found = grunt.util._.find(subDirectories,function(item){
                return (filepath.indexOf(item) !== -1);
            });
            destinationBasePath = destination.split('*').shift();
//          grunt.log.debug('Destination path:', destination, filepath, subDirectories, found, s);
            path = destinationBasePath + filepath.replace(found,'');
        }
        return replaceExtension(path, destination.split('.').pop());
    }

    function initOptions(){
        if(files === undefined){
            var options = grunt.config.get(NAME).options;
            //load all partials
            files = grunt.file.expand(options.partials);
            files.forEach(function(file){
                Handlebars.registerPartial(getBasename(file),grunt.file.read(file));
            });

            //load all helpers
            files = grunt.file.expand(options.helpers);
            files.forEach(function(file){
                //outside tasks-directory
                var s = require(process.cwd()+'/'+file);
                Handlebars.registerHelper(getBasename(file),s);
            });

            if(options.assetsFolder === undefined && options.assetsfolder !== undefined){
                grunt.option('assetsFolder','/');
            }else if(options.assetsFolder !== undefined && options.assetsfolder === undefined){
                if(options.assetsFolder){
                    grunt.option('assetsFolder',options.assetsFolder);
                }else{
                    grunt.option('assetsFolder',options.assetsfolder);
                }
            }else{
                grunt.option('assetsFolder','/');
            }

            if(!options.ignoreFilesHelper || !options.ignorefileshelper || options.ignoreFilesHelper === undefined){
                grunt.log.debug('Add Handlebars helper ("{{staticHandlebarsFiles}}") for files.');
                Handlebars.registerHelper('staticHandlebarsFiles', require(__dirname+'/helper/staticHandlebarsFiles.js'));
            }
        }
    }

    function requestPackage(files, otherFiles, packageType, packages) {
        var parts = packageType.split(' ');
        var extension = parts[0];
        var qualifier = parts.length > 1 ? '-' + parts[1] : '';
        if (files.length > 0) {
            var spec = files.join('\t');
            try {
                var hash = md5(spec);
//              grunt.log.debug('Line:', [extension, hash, spec].join('\t'));
                if (!packages[packageType]) {
                    packages[packageType] = [];
                }
                packages[packageType][hash] = files.slice(0);
            } catch (error) {
                grunt.log.error('Error in adding request:', error);
                throw error;
            }
//          grunt.log.debug('Qualifier: ' + packageType + ":", qualifier);
            var fileName = extension + '/' + hash + qualifier + '.' + extension;
            var fileSpec = qualifier ? { path: fileName, qualifier: parts[1] } : fileName;
            otherFiles.push(fileSpec);
        }
    }

    function replaceFiles(context, packages) {
        if (!context.files) {
            context.files = ['favicon.ico'];
        }
        var files = context.files;
        var packageFiles = {};
        var otherFiles = [];
        var i = 0;
        var il = files.length;
        while (i < il) {
            var file = files[i];
            var fileName;
            var qualifier;
            if (typeof file === 'string') {
                fileName = file;
                qualifier = '';
            } else {
                fileName = file.path;
                qualifier = file.qualifier;
            }

            var extension = fileName.split('.').pop();
            var packageType = extension + (qualifier ? ' ' + qualifier : '');
            if (!packageFiles[packageType]) {
                packageFiles[packageType] = [];
            }
            if (extension == 'js' || extension == 'css' || qualifier) {
                packageFiles[packageType].push(fileName);
            } else {
                otherFiles.push(fileName);
            }
            i++;
        }
        for (var key in packageFiles) {
            if (packageFiles.hasOwnProperty(key)) {
                requestPackage(packageFiles[key], otherFiles, key, packages);
            }
        }
        context.files = otherFiles;
        grunt.log.debug('Other files:', otherFiles);
    }

    function generatePackages(packages, options) {
        for (var packageType in packages) {
            if (!packages.hasOwnProperty(packageType)) {
                continue;
            }
            var parts = packageType.split(' ');
            var extension = parts[0];
            var qualifier = parts.length > 1 ? '-' + parts[1] : '';
//          grunt.log.debug('Package type:', packageType, parts, extension, qualifier);
            var packageGroupDirectory = options.packageDirectory + '/' + extension;
            var suffix = qualifier + '.' + extension;
            generatePackageGroup(packages[packageType], options.sourceRoot, packageGroupDirectory, suffix, '\n\n');
        }
    }

    function generatePackageGroup(packageList, sourceRoot, packageGroupDirectory, suffix, separator) {
        suffix = suffix || '';
        separator = separator || '';
        for (var hash in packageList) {
            if (packageList.hasOwnProperty(hash)) {
                var sources = packageList[hash];
                var contentList = _.map(sources, function(source) {
                    var filePath = typeof source === 'string' ? source : source.path;
                    filePath = sourceRoot + '/' + filePath;
                    if (!grunt.file.exists(filePath)) {
                        grunt.log.warn('Source file "' + filePath + '" not found.');
                        return '';
                    } else {
                        grunt.log.debug('Read source file "' + filePath + '"');
                        return grunt.file.read(filePath);
                    }
                });
                var targetFile = packageGroupDirectory + '/' + hash + suffix;
                var targetContent = contentList.join(separator);
                grunt.log.debug('Generate package: ' + targetFile + ': [' + (targetContent.length) + ']');
                grunt.file.write(targetFile, targetContent);
            }
        }
    }

    function extend(target, source) {
        for (var key in source) {
            if (!source.hasOwnProperty(key)) {
                continue;
            }
//          grunt.log.debug("Key suffix:", key.substring(-4))
            var pos = key.length - 4;
            if (key.substring(pos) == '%add') {
                var modifyKey = key.substring(0, pos);
//              grunt.log.debug("Modify key:", modifyKey);
                if (target[modifyKey]) {
                    target[modifyKey] = _.union(target[modifyKey], source[key]);
//                  grunt.log.debug('Modified value:', target[modifyKey]);
                } else {
                    target[modifyKey] = source[key];
                }
            } else {
                target[key] = source[key];
            }
        }
//      grunt.log.debug("Extended:", target);
    }

    function getContext(basePath, jsonFile, prefix) {
        var context = { targetPath: null };
        prefix = prefix || '';
        if (grunt.file.exists(jsonFile)){
            var childContext = { extends: [] };
            try {
                // TODO JSON.parse works, but grunt.file.readJSON not
                // if file not exist, grunt will pop up an error
                childContext = JSON.parse(grunt.file.read(jsonFile, { encoding: 'utf8' }));
            }catch (e) {
                grunt.log.write('\n');
                if (e instanceof SyntaxError) {
                    grunt.fail.fatal('Your JSON file ('+jsonFile+') has no valid syntax', e);
                }else if (e.origError.errno === 34) {
                    //no json file found
                    grunt.fail.fatal(new Error('No context file (like ' + e.origError.path+') provided at ' + jsonFile + ' . See documentation for more information.'));
                }else{
                    grunt.fail.fatal(e);
                }
            }
            if (childContext.extends) {
                var supers = typeof childContext.extends === 'string' ? [childContext.extends] : childContext.extends;
                _.each(supers, function(superContextFile) {
                    var superContext = getContext(basePath, basePath + '/' + superContextFile, prefix + '  ');
                    extend(context, superContext);
                });
                extend(context, childContext);
            } else {
                context = childContext;
            }
        }
        grunt.log.debug(prefix + 'Got context:', jsonFile);
        return context;
    }

    //register task
    grunt.registerMultiTask(NAME, 'Create static html from handlebars-files.', function() {
        initOptions();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            pageRoot: '.',
            skipRendering:false,
            useSameFilename:true,
            subDirectories:[]
        });
        grunt.log.debug('Options:', options);

        //check if template-data has the same basename
        if(options.json){
            options.useSameFilename = false;
        }

        //check if helpers or partials are overruled
        options.disableHelpers = grunt.util._.isEmpty(options.helpers);
        options.disablePartials = grunt.util._.isEmpty(options.partials);

        if(typeof options.json === "string"){
            options.json = [options.json];
        }

        //TODO ALL references to itself need to be switched = memory leak
        //retrieve base folders to copy correctly into destination folders
        options.subDirectories = sourceDirectory(this.data.files,this.target);

        grunt.log.write('Rendering "'+this.target+'" ...\n');

        // Iterate over all specified file groups.
        var packages = {};
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
                if(hbs){
                    grunt.log.debug("Process page:", filepath);
                    //get context data to use with handlebars templates
                    var jsonFile;
                    if(options.useSameFilename){
                        jsonFile = filepath.substr(0,filepath.lastIndexOf('.')) + '.json';
                    }else{
                        //another json file provided
                        jsonFile = options.json[i];
                    }
                    var context = getContext(options.pageRoot, jsonFile);
                    grunt.log.debug('Context:', context);

                    replaceFiles(context, packages);

                    try{
                        //ignore errors with used helpers/partials
                        if(errors.length === 0){
                            //compile
                            var template = Handlebars.compile(file);
                            output = template(context);
                        }
                    }catch(e){
                        errors.push({type:'compile',file:filepath,context:context ? '' : context.substr(0,100),error:e});
                        grunt.fail.fatal(e);
                    }

                    //determine output path
                    var path;
                    if (context.targetPath) {
                        path = destinationPath(f.dest,context.targetPath,options.subDirectories);
                        grunt.log.debug("Custom path:", path);
                    } else {
                        path = destinationPath(f.dest,filepath,options.subDirectories);
                        var baseName = path.split('/').pop();
                        if (baseName != 'index.html') {
                            path = path.replace(/[/]*([.][^/]*)?$/, '/index.html');
                        }
                        grunt.log.debug("Standard path:", path);
                    }

                    //save
                    grunt.log.debug('Save:',path);
                    grunt.file.write(path,output);
                }else{
                    grunt.log.debug('Save:',destinationPath(f.dest,filepath,options.subDirectories));
                    //just a html file, no handlebars
                    grunt.file.write(destinationPath(f.dest,filepath,options.subDirectories),file);
                }
            });
            i++;
        });
        grunt.log.debug('Packages:', packages);
        //succeeded
        grunt.log.ok();

        generatePackages(packages, options);

        if(errors.length > 0){
            grunt.log.error('\n##### ERRORS #####');
            //if any errors, post them
            grunt.util._.each(errors,function(item){
                grunt.log.errorlns(item.file,'-',item.message);
            });
            grunt.fail.fatal(new Error('Compile errors, see above'));
        }

        //cleanup / free memory
        options = null;
  });
};
