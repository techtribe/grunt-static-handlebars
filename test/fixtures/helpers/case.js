//name of file is used with handlebars!
module.exports = function(name,context){
    //necessary
    var handlebars = require('handlebars');
    console.log('execute case',typeof Handlebars);
    var str = 'maar kan ook zo een mooie <b>'+this.title+'</b>';
    return new handlebars.SafeString(str);
}