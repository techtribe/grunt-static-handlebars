(function() {

    function toType (obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    function showString(str) {
        return '"' + str.replace(/(["\\])/, '\\$1') + '"';
    }

    function show(object, limit) {
        var result;
        limit = limit === null ? 3 : limit;
        if (limit < 1) {
            result = '...';
        } else if (result === null) {
            result = 'null';
        } else if (typeof object === 'string') {
            result = showString(object);
        } else if (typeof object === 'object') {
            if (object === Handlebars) {
                result = '[Handlebars]';
            } else if (object instanceof Array) {
                result = '[' + _.map(object, function(item) { return show(item); }).join(', ') + ']';
            } else if (object instanceof String) {
                result = showString(object);
            } else {
                var properties = [];
                _.forOwn(object, function(value, key) { properties.push(key + ': ' + show(value)); });
                result = '{\n' + properties.join(',\n') + '}';
            }
        } else {
            result = '' + object;
        }
        return result
    }

    function showParts(list) {
        return _.map(list, function(item) {
            return typeof item === 'string' ? item : show(item);
        }).join(': ');
    }

    function abstractLog(list) {
        if (console.log.apply) {
            console.log.apply(console, list);
        } else {
            console.log(showParts(list));
        }
    }

    function logDebug() {
        var debugArguments = _.map(arguments);
        abstractLog(debugArguments);
    }

    function logError() {
        var errorArguments = ['ERROR:'].concat(_.map(arguments));
        abstractLog(errorArguments);
    }

    var xhr;
    if (typeof XMLHttpRequest === "undefined") {
        xhr = function () {
            try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
            catch (e) {}
            try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
            catch (e) {}
            try { return new ActiveXObject("Microsoft.XMLHTTP"); }
            catch (e) {}
            // Microsoft.XMLHTTP points to Msxml2.XMLHTTP and is redundant
            throw new Error("This browser does not support XMLHttpRequest.");
        };
    } else {
        xhr = XMLHttpRequest;
    }
    logDebug(xhr);

    var reference = { errors: [] };

    function getBaseName(filename){
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

    function getResourceText(url, silent) {
        silent = silent || false;
        var xmlHttp;
        xmlHttp = new xhr();
        xmlHttp.onreadystatechange = function() {
//          logDebug('XML HTTP state change: ' + xmlHttp.readyState);
        }
        try {
            xmlHttp.open('GET', url, false);
            xmlHttp.send(null);
        } catch (error) {
            silent || logError('Error while retrieving: [' + url + ']');
            throw error;
        }
        /*
        for (var resultProperty in xmlHttp) {
            if (!xmlHttp.hasOwnProperty(resultProperty)) {
                continue;
            }
            logDebug('XML HTTP property:', resultProperty, xmlHttp[resultProperty]);
        }
        //*/
        var result = xmlHttp.status == 200 ? xmlHttp.responseText : null;
        logDebug('Get resource text:', url, (result === null ? null : '[[' + result.substr(0, 80) + ' ...]'));
        return result;
    }

    function getResourceObject(url) {
        var responseText = null;
        try {
            responseText = getResourceText(url, true);
        } catch (error) {
            logDebug('Error while retrieving: [' + url + ']');
        }

        var resourceObject = null;
        if (responseText === null) {
            logError('No JSON response');
        } else {
            var firstChar = responseText.substring(0, 1);
            if (firstChar != '{' && firstChar != '[') {
                logError('No JSON response: [[' + ('' + responseText).substring(0, 20) + ']]');
            } else {
                logDebug('JSON response text: [[' + responseText.substr(0, 80) + ' ...]]');
                if (JSON) {
                    resourceObject = JSON.parse(responseText);
                } else {
                    resourceObject = eval(responseText);
                }
                logDebug('JSON response object:', resourceObject);
            }
        }
        return resourceObject;
    }

    function processUrls(list, handler, baseUrl, ext) {
        var extension = ext || '';
        var pathPrefix = baseUrl ? baseUrl + '/' : '';
        var i = 0;
        var il = list.length;
        while (i < il) {
            var itemSpec = list[i];
            logDebug('Process resource:', itemSpec);
            itemSpec = resource(itemSpec);
            logDebug('Resource:', itemSpec);
            if (typeof itemSpec === 'string') {
                itemSpec = { path: itemSpec };
            }
            var path = itemSpec.path;
            if (path) {
                itemSpec.url = itemSpec.mode === 'external' ? path : pathPrefix + path + extension;
                logDebug('Resource URL:', itemSpec.url);
                handler(itemSpec);
            }
            i++;
        }
    }

    function processResources(list, handler, baseUrl, ext) {
        processUrls(list, function(resource) {
            var url = resource.url;
            var content = getResourceText(url);
            handler(url, content);
        }, baseUrl, ext);
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
                    target[modifyKey] = target[modifyKey].concat(source[key]);
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

    function executeCode(code) {
//      logDebug('Code: [[' + code + ']]');
        var module = {};
        eval(code);
        return module.exports;
    }

    function getRedirectUrl(originalUrl, urlPrefix, redirectMappingUrl) {
        logDebug('Original URL:', originalUrl, redirectMappingUrl);
        var result = null;
        var redirectMappings = getResourceObject(redirectMappingUrl);
        redirectMappings = (toType(redirectMappings) == 'array' ? redirectMappings : [redirectMappings]);
        var n = 0;
        var nl = redirectMappings.length;
        while (n < nl) {
            var redirectMapping = redirectMappings[n];
            logDebug('Redirect mapping:', redirectMapping, originalUrl);
            if (redirectMapping !== null && redirectMapping.src) {
                var i = 0;
                var il =redirectMapping.src.length;
                while (i < il) {
                    var srcUrl = urlPrefix + redirectMapping.src[i];
                    logDebug('Source URL:', srcUrl)
                    if (srcUrl == originalUrl) {
                        result = redirectMapping.dest;
                        break;
                    }
                    i++;
                }
            }
            if (result !== null) {
                break;
            }
            n++;
        }
        logDebug('Redirect URL:', result);
        return result;
    }

    function addConditional(qualifier, element, attributes, close) {
        var result = false;
        var head = document.getElementsByTagName('head')[0];
        if (qualifier) {
            head.appendChild(document.createComment(' Qualifier: ' + qualifier + ' '));
            var qualifierParts = qualifier.split('-');
            if (qualifierParts.length == 3 && qualifierParts[0] == 'IE') {
                result = true;
                var comparator = qualifierParts[1];
                var version = qualifierParts[2];
                var commentParts = []
                commentParts.push('[if ' + comparator + ' IE ' + version + ']>');
                commentParts.push('<');
                commentParts.push(element);
                _.forOwn(
                    attributes,
                    function (value, key, object) {
                        commentParts.push(' ');
                        commentParts.push(key);
                        commentParts.push('=\'');
                        commentParts.push(value);
                        commentParts.push('\'');
                    }
                );
                commentParts.push('>');
                if (close) {
                    commentParts.push('</');
                    commentParts.push(element);
                    commentParts.push('>');
                }
                commentParts.push('<![endif]');
                head.appendChild(document.createComment(commentParts.join('')));
                head.appendChild(document.createTextNode('\n'));
            }
        }
        return result;
    }

    function loadJavaScript(resources) {
        if (resources.length > 0) {
            var resource = resources.shift();
            var url = resource.url;
            logDebug('Load JavaScript resource: ', resource, ':', url);
            _.each(resources, function(resource) {logDebug('Next resource', resource)});

            var head = document.getElementsByTagName('head')[0];
            var qualifier = resource.qualifier;
            var conditional = addConditional(qualifier, 'script', {src: url, type: 'text/javascript'}, true);
            if (conditional) {
                setTimeout(function(){loadJavaScript(resources);}, 0);
            } else {
                var script = document.createElement('script');
                script.setAttribute('type', 'text/javascript');
                script.setAttribute('src', url);
                head.appendChild(script);
                head.appendChild(document.createTextNode('\n'));
                script.onload = (function(){loadJavaScript(resources)});
            }
        } else {
            logDebug('Finished loading JavaScript');
            if (window.onload) {
                logDebug("Execute window on-load:", window.onload)
                window.onload();
            }
        }
    }

    var javaScriptResources = [];

    function prepare() {
        var location = window.location;
        var protocol = location.protocol;
        var host = location.hostname;
        var urlPrefix = protocol + '//' + host + '/handlebars/templates';
        var htmlPath = location.pathname;
        var basePath = htmlPath.replace(/([.]html?|[/])$/, '');
        var templateBaseURL = urlPrefix + basePath;

        var templateExtension = 'html';
        var templateSuffix = '.' + templateExtension;
        var contextSuffix = '.json';
        var helperSuffix = '.js';
        var partialSuffix = '.html';
        var redirectSuffix = '.redirect';

        var templateUrl = templateBaseURL + templateSuffix;
        var templateUrlParts = null;
        var templateBaseName = null;
        var templateBaseUrl = null;
        var templateSource = null;
        logDebug('Template:', templateUrl, urlPrefix, templateSuffix);
        if (templateUrl == urlPrefix + templateSuffix || templateUrl == urlPrefix + '/' + templateSuffix) {
            templateUrl = urlPrefix + '/index' + templateSuffix;
            templateSource = getResourceText(templateUrl);
        } else {
            templateSource = getResourceText(templateUrl);
            if (templateSource === null) {
                templateUrlParts = templateUrl.split('/');
                templateBaseName = templateUrlParts.pop();
                if (templateBaseName == '' || templateBaseName == '.') {
                    templateBaseName = templateUrlParts.pop();
                }
                var templateBaseParts = templateBaseName.split('.');
                if (templateBaseParts[templateBaseParts.length - 1] == templateExtension) {
                    templateBaseParts.pop();
                }
                templateBaseName = templateBaseParts.join('.');
                templateBaseUrl = templateUrlParts.join('/') + '/' + templateBaseName + '/';
                templateUrl = templateBaseUrl + templateBaseName + templateSuffix;
                templateSource = getResourceText(templateUrl);
                if (templateSource === null) {
                    templateUrl = templateBaseUrl + 'index' + templateSuffix;
                    templateSource = getResourceText(templateUrl);
                }
            }
        }

        var result = null;
        if (templateSource === null) {
            logDebug('Redirect mapping URL parts: ', templateBaseUrl, templateBaseName, redirectSuffix);
            var redirectMappingUrl = templateBaseUrl + templateBaseName + redirectSuffix;
            logDebug('Redirect mapping URL:', redirectMappingUrl);
            var newLocation = getRedirectUrl(templateUrl, urlPrefix, redirectMappingUrl);
            if (newLocation === null) {
                var redirectBaseUrl = templateUrlParts.join('/') + '/';
                var redirectBaseName = templateUrlParts.pop();
                logDebug('Redirect mapping URL parts: ', redirectBaseUrl, redirectBaseName, redirectSuffix);
                redirectMappingUrl = redirectBaseUrl + redirectBaseName + redirectSuffix;
                logDebug('Redirect mapping URL:', redirectMappingUrl);
                newLocation = getRedirectUrl(templateUrl, urlPrefix, redirectMappingUrl);
            }
            if (newLocation === null) {
                logDebug("GLOBAL");
                newLocation = getRedirectUrl(templateUrl, urlPrefix, urlPrefix + '/global' + redirectSuffix);
            }
            if (newLocation !== null) {
                window.location = newLocation;
            }
//          window.location = '/';
        } else {
            logDebug('Template source:', '[[' + templateSource.substr(0, 80) + ' ...]');
            var template = Handlebars.compile(templateSource);

            templateUrlParts = templateUrl.split('.');
            templateUrlParts.pop();
            var contextUrl = templateUrlParts.join('.') + contextSuffix;
            logDebug('Context URL: ' + contextUrl);
            var trace = { "extends": [] };
            var applicationContext = {
                getResourceObject: getResourceObject,
                logDebug: logDebug,
                logError: logError,
                packages: {},
                errors: [],
                options: {}
            };
            var context = getContext(urlPrefix, contextUrl, applicationContext, trace);
            if (!context) {
                context = {};
            }
            context["extends"] = trace["extends"];
            context.handlebarsInstance = Handlebars;
            context.logDebug = logDebug;
            context.pagePath = templateUrl.substr(urlPrefix.length);
            logDebug('Context:', context);
            logDebug('Context files:', context.files);

            if (context) {
                var baseUrl = protocol + '//' + host;
                if (context.files) {
                    var head = document.getElementsByTagName('head')[0];
                    processUrls(context.files, function(resource) {
                        var url = resource.url;
                        var tp = resource.type;
                        logDebug('File URL:', url);
                        if (tp === '*.js') {
                            logDebug('Found JavaScript resource:', resource);
                            javaScriptResources.push(resource);
                            /*
                            if (content) {
                                logDebug('Script: [[' + content.substring(0, 50) + '...]]');
                                executeCode(content);
                            }
                            //* /
                            var script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('src', url);
                            document.getElementsByTagName('head')[0].appendChild(script);
                            //*/
                        } else if (tp === '*.css') {
                            logDebug('CSS resource: ' + url);
                            var qualifier = resource.qualifier;
                            var conditional = addConditional(
                                qualifier,
                                'link',
                                {
                                    rel: 'stylesheet',
                                    type: 'text/css',
                                    href: url
                                }
                            );
                            if (!conditional) {
                                var link = document.createElement('link');
                                link.setAttribute('rel', 'stylesheet');
                                link.setAttribute('type', 'text/css');
                                link.setAttribute('href', url);
                                head.appendChild(link);
                                head.appendChild(document.createTextNode('\n'));
                            }
                        }
                    }, baseUrl);
                }
                delete context.files;

                if (context.helpers) {
                    processResources(context.helpers, function(url, content) {
                        var baseName = getBaseName(url);
                        logDebug('Helper resource: [' + baseName + ']: ' + url);
                        var fn = executeCode(content);
//                      logDebug('Function: ', fn);
                        Handlebars.registerHelper(baseName, fn);
                    }, baseUrl + '/handlebars/helpers', helperSuffix);
                }

                if (context.partials) {
                    processResources(context.partials, function(url, content) {
                        var baseName = getBaseName(url);
                        logDebug('Partial template resource: [' + baseName + ']: ' + url);
                        Handlebars.registerPartial(baseName, content);
                    }, baseUrl + '/handlebars/partials', partialSuffix);
                }
            }

            try {
                logDebug('Template:', '[' + templateSource.substr(0, 80) + ' ...]');
                logDebug('Context:', context);
                var content = template(context);
                logDebug('Content:', '[' + content.substr(0, 1024) + ' ...]');
                content = content.replace(/^[\s\S]*<body[^>]*>/, '');
                content = content.replace(/<\/body[\s]*>[\s\S]*$/, '');
                result = content;
            } catch (error) {
                logError('Error while applying template:', error);
            } finally {
                if (result) {
                    logDebug('Result: ', '[' + result.substr(0, 1024) + ' ...]');
                } else {
                    logDebug('Result: null');
                }
            }
        }
        return result;
    }

    var result = prepare();

    var oldOnLoad = window.onload;
    logDebug('Window on-load:', oldOnLoad);
    function replaceBody () {
        if (result != null) {
            var body = document.getElementsByTagName('body')[0];
            body.innerHTML = result;
            if (oldOnLoad) {
                oldOnLoad();
            }
            window.onload = null;
            loadJavaScript(javaScriptResources);
        }
    }

    window.onload = replaceBody;

})();
