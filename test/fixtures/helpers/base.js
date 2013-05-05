//name of file is used with handlebars!
module.exports = function(context,options){
    //necessary
//    var handlebars = require('handlebars');
//    console.log('base this:',this);
//    console.log('base context:',context);
//    console.log('base options:',options);


    var str = 'wat een mooie <b>'+this.title+'</b>';
    return str;
//    return new handlebars.SafeString(str);
}