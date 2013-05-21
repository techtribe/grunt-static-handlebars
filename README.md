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
This grunt-plugin enables you to separate context from (HTML)markup by using [Handlebars](http://handlebarsjs.com) templates. Any type of files (not just HTML) can be used, but its features are focused on providing tools to make the integration with grunt easy.

A template can have a ```.json``` file to add context variables you will use inside your template. Due to the nature of static HTML, a template without the name of ```index.html``` will be put in a folder corresponding its name where the processed file will be named ```index.html```. So you will be able to link to that page by using ```www.yoursite.com/path``` so no additional .html extensions need to reside in your URL.

### Usage
In your project's Gruntfile, add a section named `static_handlebars` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  staticHandlebars: {
    options: {
      // Task-specific options go here.
    },
    your_target_name: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options
Options can reside in the general definition of this plugin or inside any task-options to overrule or define the options to use with that (sub)task.

#### partials
Type: `String` or `Array`  
Default value: `''`  
Extension: `*` whatever you like (for example ```.hbt``` or ```.html```)

A string or array value that resembles the (type of) files to use as [Handlebars](http://handlebarsjs.com)-partials.

#### helpers
Type: `String` or `Array`  
Default value: `''`  
Extension: `.js`

A string or array value that resembles the files to use as [Handlebars](http://handlebarsjs.com)-helpers.

#### assets
Type: `Object`

An object to configure the use of ```{{staticHandlebarsFiles}}``` or your own helper to embed the creation of assets like ```js``` and ```css``` in an optimized way. This feature enables you to define the path inside ```.html``` files to concatenate them and copy them to a folder for post-processing (minify) or just in the right production folder.

_Note: if you use this plugin for non-html files you can ignore this option as long as you don't use ```{{staticHandlebarsFiles}}``` in your Handlebars templates._

##### Default value

```js
{
	templatesPath:'.',//optional
	sourcesPath:'.',
	assetsPath:'/',
	packagedFilesPath:'.', //optional
	ignoreHelper:false //optional
}
```

where in ```.json``` files you can add

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
to use as input for the processing of files. This means that this Handlebars template: 

* use ```base.json``` as source for the ```files```-list
* use extra files only for this template with ```files%add```
* use extra context like title / page to use in your template as ```{{title}}``` and ```{{page.title}}```

##### assets.templatePath (optional)
Type: `String`
Default value: `.`  
Already set but you can override the base path to find your base context-files that are used in ```.json``` as the ```extends:['base.json']``` mechanism to keep your ```files```-property in ```.json``` files small and in line with the desired base context to use.

##### assets.sourcesPath
Type: `String`
Default value: `.`  
Define the path where your sources (so what comes before ```js/base.js```) originating from the ```Gruntfile.js``` directory.

##### assets.assetsPath
Type: `String`
Default value: `/`  
Define the path which is used inside the processed ```.html``` files (like ```/js/base.js```).

##### assets.packagedFilesPath (optional)
Type: `String`
Default value: `.`  
Define the path where all concatenated files will be put. These files are all combinations of (separate) ```js``` or ```css``` files. You can choose to put them in an alternate folder to minify (```grunt-contrib-uglify``` or ```grunt-contrib-cssmin```) or put them in the production folder.

##### assets.ignoreHelper (optional)
Type: `Boolean`
Default value: `false`  
If you would like to overwrite the use of ```{{staticHandlebarsFiles}}``` inside your templates, reset to true and register your own helper with the ```staticHandlebarsFiles``` name.

#### json
Type: `String` or `Array`  
Default value: `''`  
Extension: `.json`

A string or array value that resembles the files to use as context-input (json). It will resemble the same amount of files as the total amount of templates inside this subtask (target).

#### files
Type: `Object` or `Array`  
Default value: `''`  
Extension: `*` whatever you like (for example ```.hbt``` or ```.html```)

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
See the ```/test``` directory for examples how to use this plugin. 

```js
grunt.initConfig({
  staticHandlebars: {
    options: {	
	   	partials:'',
    	helpers:''
    },
    simpleTarget: {
        // Target-specific file lists and/or options go here.
    	options:{
    		json:''
    	},
		files:{'tmp/simple/*.html':'test/fixtures/homepage/*.hbt'}
    },
    complexTarget: {
	    options:{
        	assets:{
            	sourcesPath: 'test/assets', //used for JS/CSS files
				packagedFilesPath: 'tmp/packages',
				assetsPath: '/'
			}
		},
		files:{'tmp/complext/**/*.html':'test/fixtures/complex/**/*.hbt'}
    }
  },
})
```

Some remarks:
* ```.hbt``` are [Handlebars](http://handlebarsjs.com)-templates but can be any extension (```.html```, ```.hbs```, etc)
* ```.hbp``` are [Handlebars](http://handlebarsjs.com)-partials but can be any extension (```.html```, ```.hbs```, etc)
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
0.6.0 - Rewrote plugin to enable "extends" mechanism as an option (not as default) + added examples + adjusted Gruntfile.js options definition + renamed options + fixed empty variables  
0.5.0 - Added "extends" mechanism to limit the file-paths needed in the context-files (normally .json files) which means you have a built-in option to include JS/CSS/?-files in an optimized way inside your ```<head>```  
0.4.3 - If no .json file is mentioned, the template context will be defaulted to {}  
0.4.2 - Fixed the processing of static files without any [Handlebars](htt://handlebarsjs.com)  
0.4.1 - Added grunt as global variable
0.4.0 - Relative path rewrite to support ```js grunt.file.setBase()```  
0.3.1 - Relative path bug fixed for [Handlebars](htt://handlebarsjs.com)-helpers  
0.3.0 - Rewrite to support helpers that use partials + added more tests  
0.2.0 - Added global Handlebars object + fixed partials-naming (+/-/_ added)  
0.1.0 - Initial release.

## TODO
* (?) option to provide string and no json-files as partials/helpers
* (?) cli-option
* (?) add or ignore target.options.partials/helpers
* (?) detect duplicate definitions of context &amp; helpers/partials
* (?) use lowercase to detect wrong definitions of code or not useful
* Add partials/helpers inside context files (see base.json for example)
* ! More flexible targetPath paths (parent-directories)
* ! use target-directory for targetPath > check destination for that?
* Other filenames than index.html possible (export already done)