// resource.js

function resource(itemSpec, assetsUrlPrefix) {
    if (typeof itemSpec === 'string') {
        itemSpec = { path: itemSpec };
    }
    assetsUrlPrefix = typeof assetsUrlPrefix === 'string' ? assetsUrlPrefix : '/';

    var item = itemSpec.path;
    if (item.charAt(0) === '/'){
        item = item.substr(1);
    }

    var tp = item;
    if (itemSpec.type) {
        tp = '*.' + itemSpec.type;
    } else {
        var ext = item.substr(item.lastIndexOf('.') + 1);
        if (ext === 'js'){
            tp = '*.js';
        } else if (ext === 'css'){
            tp = '*.css';
        } else if (ext === 'ico'){
            tp = '*.ico';
        }
    }
    itemSpec.type = tp;

    var url;
    if (itemSpec.mode && itemSpec.mode === 'external') {
        url = itemSpec.path;
    } else {
        var folder = assetsUrlPrefix;
        if (folder.charAt(folder.length - 1) === '/'){
            folder = folder.substr(0, folder.length - 1);
        }
        url = folder + '/' + item;
    }
    itemSpec.url = url;

    if (itemSpec.qualifier && itemSpec.qualifier.substring(0, 2) == 'IE') {
        var parts = itemSpec.qualifier.split('-');
        itemSpec.ieComparator = parts[1];
        itemSpec.ieVersion = parts[2];
    }
    return itemSpec;
}

module.exports = resource;
