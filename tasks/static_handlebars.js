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

    //functions
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

    function baseDirectory(data,task,isObject){
        if(isObject === undefined) isObject = true;
        //retrieve base directory to use as a root folder with deeper/longer file paths
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
                var directory;
                if(isObject){
                    directory = values[0];
                }else{
                    directory = item;
                }
                if(directory.indexOf('**') !== -1){
                    //fill subdirectories
                    var s = directory.split('**');
                    s.pop();
                    p.push(s[0]);
                }else{
                    //no subdirectories
                    if(directory.indexOf('*') === -1){
                        p.push(directory.substr(0,directory.lastIndexOf('/')+1));
                    }else{
                        p.push(directory.split('*')[0]);
                    }
                }
                if(isObject){
                    //check keys/values if they match in depth (**/* cannot match *.hbt in input/output folders)
                    grunt.util._.forIn(item,function(value,key){
                        if(value.indexOf('**') !== -1){
                            if(key.indexOf('**') === -1){
                                grunt.fail.fatal('Destination ('+key+') needs to have the same depth as the input file ('+value+') at task "',task,'"');
                            }
                        }else if(key.indexOf('**') !== -1){
                            grunt.fail.fatal('Destination ('+key+') needs to have the same depth as the input file ('+value+') at task "',task,'"');
                        }
                    });
                }else{
                    //just a string, fine.
                }
            });
            data = null;

            var out = grunt.util._.uniq(p)[0];
            if(out.charAt(out.length-1) === '/'){
                out = out.substr(0,out.length-1);
            }
            return out;
        }else{
            data = null;
            return [];
        }
    }

    function destinationPath(destination,filepath,fileDirectory){
        //match fileDirectory to destination path
        var root = baseDirectory([destination],'destinationPath',false);
        var source = filepath.replace(fileDirectory,'');

        //replace extension
        var filename = root+source;
        var extension = destination.split('.').pop();
        return filename.substr(0,filename.lastIndexOf('.'))+'.'+extension;
    }

    function initOptions(options){
        if(files === undefined){
            var options = grunt.config.get(NAME).options;

            //load all partials
            if(!grunt.util._.isEmpty(options.partials)){
                files = grunt.file.expand(options.partials);
                files.forEach(function(file){
                    Handlebars.registerPartial(getBasename(file),grunt.file.read(file));
                });
            }

            //load all helpers
            if(!grunt.util._.isEmpty(options.helpers)){
                files = grunt.file.expand(options.helpers);
                files.forEach(function(file){
                    //outside tasks-directory
                    var s = require(process.cwd()+'/'+file);
                    Handlebars.registerHelper(getBasename(file),s);
                });
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
            var packageGroupDirectory = options.assets.packagedFilesPath + '/' + extension;
            var suffix = qualifier + '.' + extension;
            generatePackageGroup(packages[packageType], options.assets.sourcesPath, packageGroupDirectory, suffix, '\n\n');
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

    function initiateAssetsObject(options){
        if(options.assets === undefined || options.assets === null){
            options.assets = {};
            grunt.fail.warn('Do not override assets with an incompatible "options.assets" property. Use the documentation!');
        }

        if(options.assets.templatesPath === undefined || options.assets.templatesPath === ''){
            options.assets.templatesPath = '.';
        }

        if(options.assets.sourcesPath === undefined || options.assets.sourcesPath === ''){
            options.assets.sourcesPath = '.';
        }

        if(options.assets.assetsPath === undefined || options.assets.assetsPath === ''){
            options.assets.assetsPath = '.';
            grunt.option('assetsPath','/');
        }else{
            grunt.option('assetsPath',options.assets.assetsPath);
        }

        if(options.assets.packagedFilesPath === undefined || options.assets.packagedFilesPath === ''){
            options.assets.packagedFilesPath = '.';
        }

        if(options.assets.concatenate === undefined || options.assets.concatenate === ''){
            options.assets.concatenate = false;
        }

        if(options.assets.ignoreHelper === undefined || options.assets.ignoreHelper === ''){
            options.assets.ignoreHelper = false;
        }

        if(options.assets.ignoreHelper === false){
            grunt.log.debug('Add Handlebars helper ("{{staticHandlebarsFiles}}") for files.');
            Handlebars.registerHelper('staticHandlebarsFiles', require(__dirname+'/helper/staticHandlebarsFiles.js'));
        }
    }

    function getContext(basePath, jsonFile, prefix) {
        var context = { targetPath: null };
        prefix = prefix || '';
        if (grunt.file.exists(jsonFile)){
            var childContext = { extends: [] };
            try {
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
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            useSameFilename:true,
            partials: '',
            helpers: '',
            json:'',
            assets:{
                templatesPath:'.',
                sourcesPath:'.',
                assetsPath:'.',
                packagedFilesPath:'.',
                concatenate:false,
                ignoreHelper:false
            }
        });

        //======= DEFAULT VALUES =======
        //check if assets is not complete
        initiateAssetsObject(options);

        //define concatenate property to use with/without helper
        if(options.assets.packagedFilesPath !== '.' && options.assets.packagedFilesPath !== undefined){
            grunt.option('concatenate',true);
        }else{
            grunt.option('concatenate',false);
        }

        grunt.log.debug('Options:', options);

        //check if template-context (data) has the same basename
        if(options.json){
            options.useSameFilename = false;
        }

        if(typeof options.json === "string"){
            options.json = [options.json];
        }

        //retrieve base folders to copy correctly into destination folders
        options.assets.templatesPath = baseDirectory(this.data.files,this.target);
        //======= DEFAULT VALUES =======

        //only once
        initOptions(options);

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

                    var context = getContext(options.assets.templatesPath, jsonFile);
                    grunt.log.debug('Context:', context);

                    //adjust filenames due to concatenation
                    if(grunt.option('concatenate') === true){
                        replaceFiles(context, packages);
                    }else{
                        //add to packages
                        if(!packages.files){
                            packages.files = [];
                        }
                        if(context.files){
                            var temp = packages.files.concat(context.files);
                            packages.files = temp.slice(0,temp.length);
                        }
                    }

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
                    if (context.targetPath != undefined) {
                        //originate from default folder with new filepath
                        path = destinationPath(f.dest,options.assets.templatesPath+'/'+context.targetPath,options.assets.templatesPath);
                        grunt.log.debug("Custom path:", path);
                    } else {
                        path = destinationPath(f.dest,filepath,options.assets.templatesPath);
                        var baseName = path.split('/').pop();
                        //to make a static file, you will need to make "folder/index.html" to enable "folder" as a link
                        if (baseName != 'index.html') {
                            path = path.replace(/[/]*([.][^/]*)?$/, '/index.html');
                        }
                        grunt.log.debug("Standard path:", path);
                    }

                    //save
                    grunt.log.debug('Save:',path);
                    grunt.file.write(path,output);
                }else{
                    grunt.log.debug('Save:',destinationPath(f.dest,filepath,options.assets.templatesPath));
                    //just a html file, no handlebars
                    grunt.file.write(destinationPath(f.dest,filepath,options.assets.templatesPath),file);
                }
            });
            i++;
        });
        grunt.log.debug('Packages:', packages);
        //succeeded
        grunt.log.ok();

        if(grunt.option('concatenate') === true){
            generatePackages(packages, options);
        }else{
            //use grunt-contrib-copy is more obvious
            if(options.assets.sourcesPath !== '.'){
                grunt.log.subhead('COPY WARNING!');
                grunt.log.error('Copy your assets from "'+options.assets.sourcesPath+'" to the correct folder you\'d like to use. (grunt-contrib-copy)');
            }
        }

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
