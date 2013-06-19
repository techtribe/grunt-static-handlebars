module.exports = function(){
    var context = this;
    if (!context.files) {
        return '';
    }
    var logDebug = context.logDebug;

    var resource = require(__dirname + '/../lib/resource.js');

    var output = '';
    _.each(context.files, function(itemSpec){
        itemSpec = resource(itemSpec, context.assetsUrlPrefix);
        logDebug('Item specification:', itemSpec);
        var suffix = '';
        if (itemSpec.ieComparator && itemSpec.ieVersion) {
            output += '    <!--[if ' + itemSpec.ieComparator + ' IE ' + itemSpec.ieVersion + ']>\n';
            suffix =  '    <![endif]-->\n'
        }
        var tp = itemSpec.type;
        var url = itemSpec.url;
        switch (tp) {
            case '*.js':
                output += '    <script src="' + url + '" type="text/javascript"></script>\n';
                break;
            case '*.css':
                output += '    <link href="' + url + '" type="text/css" media="screen" rel="stylesheet"/>\n';
                break;
            case '*.ico':
                output += '    <link rel="shortcut icon" href="' + url + '"/>\n';
                break;
        }
        output += suffix;
    });
    //remove last \n
    output = output.substr(0, output.length - 1);
    return new context.handlebarsInstance.SafeString(output);
}