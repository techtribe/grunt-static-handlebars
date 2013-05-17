# GRUNT-STATIC-HANDLEBARS

> Compile your handlebars templates into static html files.

## Getting Started
This plugin requires Grunt `~0.4.1` which uses [Node.js](http://nodejs.org/download).

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-static-handlebars --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-static-handlebars');
```

## Documentation

### Overview
In your project's Gruntfile, add a section named `static_handlebars` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  staticHandlebars: {
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

#### options.pageRoot

Type: `String` or `Array`  
Default value: `''`  

The file directory to use as base folder for your templates. (will be automated later)

#### options.sourceRoot

Type: `String` or `Array`  
Default value: `''`  

The directory in which all your assets are. This path will be default relative to the current working directory and be added before the provided assets paths like ```css/base.css``` you will find in your context-files.

#### options.packageDirectory

Type: `String` or `Array`  
Default value: `''`  

The directory in which all assets are concatenated which you can copy to the correct target folder __OR__ use to minify them before copying.

#### options.assetsFolder

Type: `String`  
Default value: `'/'`  

The directory in which all assets are provided and referenced by inside the processed html template.

#### options.ignoreFilesHelper

Type: `Boolean`  
Default value: `false`  

While [Handlebars](http://handlebarsjs.com) is mostly used for .html files this option provides the ability to ignore the ```{{staticHandlebarsFiles}}``` template tag and write your own version if set to ```true```. 
If kept at ```false``` you can describe in your context-files which kind of assets are needed on that page.

So, define a .html/.hbt file as a Handlebars template and add a (same filename) .json file in the same folder. In that .json file you can describe assets like

```json
{
    "extends": [ "base.json" ],
    "files%add": [
        "/css/homepage.css",
        "/js/homepage.js"
    ],
    "title":"A new page title.",
    "page":{
        "title":"Welcome",
        "content":"At our new test site."
    },
    "footer":"Some contact information about how to get in touch with us."
}
```

This means that this Handlebars template: 

* use the base.json as source for the ```files```-list
* add extra files only for this template with ```files%add```
* and use extra context like title / page to use in your template as ```{{title}}``` and ```{{page.title}}```

This setup provides flexibility to keep a base list of files and add or ignore files that are not needed on a certain page.

You can also ignore ```extends``` and ```files``` to just render the template with the provided context (json), like:

```json
{
    "title":"A new page title.",
    "page":{
        "title":"Welcome",
        "content":"At our new test site."
    },
    "footer":"Some contact information about how to get in touch with us."
}
```

_Note: if you use this plugin for non-html files you can ignore this option as long as you don't use ```{{staticHandlebarsFiles}}``` in your Handlebars templates._

#### target

```js
grunt.initConfig({
  staticHandlebars: {
    options: {
    	pageRoot: 'templates', //root directory
    	sourceRoot: 'assets', //used for JS/CSS files
    	packageDirectory: 'target/tmp/package', //packaged files directory
    	assetsFolder: '/',
    	ignoreFilesHelper: false,
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
Extension: `*` whatever you like (```.hbt``` or ```.html```)

A string or array value that resembles the files to use as [Handlebars](http://handlebarsjs.com)-templates.

```js
{'destinationFolder/file.html':'inputFolder/input.hbt'}
```  
or  
```js
{'destinationFolder/*.html':'inputFolder/*.hbt'}
```  
or
```js
{'destinationFolder/**/*.html':'inputFolder/**/*.hbt'}
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
0.5.0 - Added "extends" mechanism to limit the file-paths needed in the context-files (normally .json files) which means you have a built-in option to include JS/CSS/?-files in an optimized way inside your ```html  <head>```  
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
* Add partials/helpers inside context files (see base.json for example)
* Ignore {{staticHandlebarsFiles}} helper
* ! More flexible targetPath paths (parent-directories)
* ! add helper to file
* ! use target-directory for targetPath > check destination for that?
* Add Packageroot as task-options and not only in general options
* ! Smarter pageRoot/packagesDirectory setup - detect working directory (see subDirectories-function)
* Detect missing pageRoot and other variables