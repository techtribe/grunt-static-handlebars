// context.js
//
// Gets a context for a page that is defined by a Handlebars template.

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

function getContext(basePath, jsonFile, applicationContext, trace, prefix) {
    prefix = prefix || '';
    var context = { targetPath: null };
    var getResourceObject = applicationContext.getResourceObject;
    var logDebug = applicationContext.logDebug;
    var logError = applicationContext.logError;
    var childContext = { extends: [] };
    try {
        // if file not exist, grunt will pop up an error
        childContext = getResourceObject(jsonFile);
    } catch (error) {
        childContext = null;
        if (error instanceof SyntaxError) {
            logError('Your JSON file (' + jsonFile + ') has no valid syntax', error);
        } else if (error.origError && error.origError.errno === 34) {
            //no json file found
            logError(new Error('No context file (like ' + error.origError.path+') provided at ' + jsonFile + ' . See documentation for more information.'));
        } else{
            logError(error);
        }
    }
    if (childContext !== null) {
        trace.extends.push(jsonFile);
        logDebug(prefix + '- extends:', childContext.extends);
//      logDebug('Child context:', childContext);
    }
    if (childContext && childContext.extends) {
        var supers = typeof childContext.extends === 'string' ? [childContext.extends] : childContext.extends;
        _.each(supers, function(superContextFile) {
            var superContext = getContext(basePath, basePath + '/' + superContextFile, applicationContext, trace, prefix + '  ');
            if (superContext !== null) {
                extend(context, superContext);
            }
        });
        extend(context, childContext);
    } else {
        context = childContext;
    }
    if (context === null) {
        logDebug(prefix + 'Failed to get context: [' + jsonFile + ']')
    } else {
        logDebug(prefix + 'Got context: [' + jsonFile + ']');
    }
    return context;
}
module.exports = getContext;