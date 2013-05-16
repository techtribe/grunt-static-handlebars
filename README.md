# GRUNT-STATIC-HANDLEBARS

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
    		json:''
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

See the ```/test``` directory for examples how to use this. Some remarks:

* ```.hbt``` are [Handlebars](http://handlebarsjs.com)-templates but can be any extension (.html, .htm, .hbs, etc)
* ```.hbp``` are [Handlebars](http://handlebarsjs.com)-partials but can be any extension (.html, .htm, .hbs, etc)
* [Handlebars](http://handlebarsjs.com)-helpers are JS functions and therefore saved as ```.js``` files.
* [Handlebars](http://handlebarsjs.com)-helpers can use:
	* ```js Handlebars.compile``` can be used in partials/helpers (like the frontend way)
	* ```js _``` can be used as ```lodash``` util class in your partials/helpers
* ```.html``` files can also be referenced as "files" to use in your GruntFile
* filenames can be connected by ```-```, ```+```,```_```
* if [Handlebars](http://handlebarsjs.com)-templates have no markup (like ```{{```) it will copied as plaintext.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.4.3 - If no .json file is mentioned, the template context will be defaulted to {}  
0.4.2 - Fixed the processing of static files without any [Handlebars](htt://handlebarsjs.com)  
0.4.1 - Added grunt as global variable
0.4.0 - Relative path rewrite to support ```js grunt.file.setBase()```  
0.3.1 - Relative path bug fixed for [Handlebars](htt://handlebarsjs.com)-helpers  
0.3.0 - Rewrite to support helpers that use partials + added more tests  
0.2.0 - Added global Handlebars object + fixed partials-naming (+/-/_ added)  
0.1.0 - Initial release.

## TODO
* (?) Handlebars inline declaration
* (?) option to provide string and no json-files as partials/helpers
* (?) cli-option
* (?) other output than .html
* A general json file as default context/data
* (?) add or ignore target.options.partials/helpers
* (?) detect duplicate definitions of context &amp; helpers/partials
* (?) use lowercase to detect wrong definitions of code or not useful