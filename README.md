# STATIC-HANDLEBARS

> Compile your handlebars templates into static html files.

## Getting Started
This plugin requires Grunt `~0.4.1` which uses [Node.js](http://nodejs.org/download).

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install static-handlebars --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('static-handlebars');
```

## Documentation

### Overview
In your project's Gruntfile, add a section named `static_handlebars` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  static_handlebars: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.partials
Type: `String` or `Array`  
Default value: `''`  
Extension: `.hbp`

A string or array value that resembles the files to use as [Handlebars](http://handlebarsjs.com)-partials.

#### options.helpers
Type: `String` or `Array`  
Default value: `''`  
Extension: `.js`

A string or array value that resembles the files to use as [Handlebars](http://handlebarsjs.com)-helpers.

#### target

```js
grunt.initConfig({
  static_handlebars: {
    options: {
    	partials:'',
    	helpers:''
    },
    target: {
        // Target-specific file lists and/or options go here.
    	options:{
    		json:'',
    		partials:[],
    		helpers:[]
    	},
    	files:{}
    },
  },
})
```

#### target.options.json

Type: `String` or `Array`  
Default value: `''`  
Extension: `.json`

A string or array value that resembles the files to use as context-input (json).

#### target.options.partials

Type: `Array`  
Default value: `options.partials`

Use this option to overrule/ignore the global partials variable during this specific target.

#### target.options.helpers

Type: `Array`  
Default value: `options.helpers`

Use this option to overrule/ignore the global helpers variable during this specific target.

#### target.files

Type: `Object` or `Array`  
Default value: `''`  
Extension: `.hbt` or `.html`

A string or array value that resembles the files to use as [Handlebars](http://handlebarsjs.com)-templates.

```js
{'destinationFolder/file.html':'inputFolder/input.hbt'}
```  
or  
```js
{'destinationFolder/*.html':'inputFolder/*.hbs'}
```  
to render all [Handlebars](http://handlebarsjs.com) templates.

## Examples

See the ```/test directory``` for examples how to use this. Some remarks:

* ```.hbt``` are [Handlebars](http://handlebarsjs.com)-templates
* ```.hbp``` are [Handlebars](http://handlebarsjs.com)-partials
* [Handlebars](http://handlebarsjs.com)-helpers are JS functions and therefore saved as ```.js``` files.
* ```.html``` files can also be referenced as "files"
* if [Handlebars](http://handlebarsjs.com)-templates have no markup (like ```{{```) it will copied as plaintext.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 - Initial release.

## TODO
* fix Handlerbars-global, now this.Handlebars is needed inside Handlebars-helpers
* (?) Handlebars inline declaration
* (?) option to provide string and no json-file?!
* (?) cli-option
* A general json file as default context/data
* Add "-" to partials, possible? what kind of restrictions exist?