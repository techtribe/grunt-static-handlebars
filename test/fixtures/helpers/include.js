module.exports = function(partial){
    // Find the partial in question.
    if (!partial) console.error("No partial name given.")

    var values = Array.prototype.slice.call(arguments,1);
    var opts = values.pop();
    var done, value;

    while (!done) {
        value = values.pop();
        if (value) partial = partial.replace(/:[^\.]+/, value);
        else done = true
    }

    partial = this.handlebarsInstance.partials[partial];
    if (!partial) return '';

    var context = _.extend(this, opts.hash);
    var template = this.handlebarsInstance.compile(partial);
    return new this.handlebarsInstance.SafeString( template(context) );
}