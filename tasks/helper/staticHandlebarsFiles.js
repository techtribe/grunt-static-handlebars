module.exports = function(){
    if(!this.files){
        return '';
    }
    var output = '';
    _.each(this.files,function(itemSpec){
        if (typeof itemSpec === 'string') {
            itemSpec = { path: itemSpec };
        }
        var item = itemSpec.path;
        var tp = item;
        var ext = item.substr(item.lastIndexOf('.')+1);
        if(ext === 'js'){
            tp = '*.js';
        }else if(ext === 'css'){
            tp = '*.css';
        }else if(ext === 'ico'){
            tp = '*.ico';
        }
        var suffix = '';
        if (itemSpec.qualifier && itemSpec.qualifier.substring(0, 2) == 'IE') {
            var parts = itemSpec.qualifier.split('-');
            var comparator = parts[1];
            var version = parts[2];
            output += '    <!--[if ' + comparator + ' IE ' + version + ']>\n';
            suffix =  '    <![endif]-->\n'
        }
        var folder = grunt.option('assetsFolder');
        if(folder.charAt(folder.length-1) === '/'){
            folder = folder.substr(0,folder.length-1);
        }
        switch(tp){
            case '*.js':
                output += '    <script src="'+folder+'/'+item+'" type="text/javascript"></script>\n';
                break;
            case '*.css':
                output += '    <link href="'+folder+'/'+item+'" type="text/css" media="screen" rel="stylesheet"/>\n';
                break;
            case '*.ico':
                output += '    <link rel="shortcut icon" href="/assets/'+item+'"/>\n';
                break;
        }
        output += suffix;
    });
    //remove last \n
    output = output.substr(0,output.length-1);
    return new Handlebars.SafeString(output);
}