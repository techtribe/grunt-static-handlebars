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

The provided "files"-directory will be used as a templates directory. See below for more information how to define your templates directory.

### Options
Options can reside in the general definition of this plugin or inside any task-options to overrule or define the options to use with that (sub)task.

##### Default value

```js
options:{
	assets:{
		filesRoot:'.', //directory where your files reside
		packagedFilesPath:'.', //optional
		partialExtension: 'html', //optional
		helperExtension: 'js', //optional
		ignoreHelper:false, //optional
	},
	json: '{}', //optional
	sourceView:true //optional
}
```

#### assets
Type: `Object`

An object to configure the use of ```{{staticHandlebarsFiles}}``` or your own helper to embed the creation of assets like ```js``` and ```css``` in an optimized way. This feature enables you to define the path inside ```.html``` files to concatenate them and copy them to a folder for post-processing (minify) or just in the right production folder.

_Note: if you use this plugin for non-html files you can ignore this option as long as you don't use ```{{staticHandlebarsFiles}}``` in your Handlebars templates._

##### assets.filesRoot
Type: `String`  
Default value: `.`  
Define the path where your sources (so what comes before ```js/base.js```) originating from the ```Gruntfile.js``` directory.

##### assets.packagedFilesPath (optional)
Type: `String`  
Default value: `.`  
Define the path where all concatenated files will be put. These files are all combinations of (separate) ```js``` or ```css``` files. You can choose to put them in an alternate folder to minify (```grunt-contrib-uglify``` or ```grunt-contrib-cssmin```) or put them in the production folder.

##### assets.ignoreHelper (optional)
Type: `Boolean`  
Default value: `false`  
If you would like to overwrite the use of ```{{staticHandlebarsFiles}}``` inside your templates, reset to true and register your own helper with the ```staticHandlebarsFiles``` name.

#### json (optional)
Type: `String` or `Array`  
Default value: `''`  
Extension: `.json`  
A string or array value that resembles the files to use as context-input (json). It will resemble the same amount of files as the total amount of templates inside this subtask (target).

#### sourceView (optional)
Type: `Boolean`  
Default value: `false`  
A Boolean to define if the `filesRoot` can be used as root folder for Nginx / Apache for a no-build environment, where you can debug HTML/CSS changes without the need of a `build` task.

See `test/fixtures/sourceView` and `Gruntfile.js` for an example how to use. 

_Note: To install the needed client-side scripts to support this feature, it is needed to execute the plugin once._

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
            	filesRoot: 'test/assets', //used for JS/CSS files
				packagedFilesPath: 'tmp/packages',
			}
		},
		files:{'tmp/complext/**/*.html':'test/fixtures/complex/**/*.hbt'}
    }
  },
})
```

Some remarks:
* if [Handlebars](http://handlebarsjs.com)-templates have no markup (like ```{{```) it will copied as plaintext.
* In any of the helpers you will need to replace the global `Handlebars` reference into `this.handlebarsInstance` to ensure the helper can parse Strings and use the needed functions.

### Context
Every Handlebars template need a context, this can be default ```js {}``` but also extended with more smart definitions.

#### Example

```json
{
    "extends": [ "base.json" ],
    "targetPath" : "contact.html",
    "assetsUrlPrefix": "/"
    "files%add": [
        "/css/homepage.css",
        "/js/homepage.js"
    ],
    "partials%add": [],
    "helpers%add": [],
    "title":"A new page title.",
    "page":{
        "title":"Welcome",
        "content":"At our new test site."
    },
    "footer":"Some contact information about how to get in touch with us."
}
```

#### extends
Use ```/base.json``` in your templates-directory (which you provide to grunt) to enable a default base-context-configuration that you can extend/overwrite per template.  
```extends:['base.json','other.json']``` or ```extends:'base.json'``` use the provided files as default context. Every other property defined in a ```json```-file per template can add or overwrite properties in this context.

#### targetPath
Adjust the name of the file being saved relative to the working directory.

#### assetsUrlPrefix
Adjust the default URL prefix of ```/``` which will be used with all the files that are referenced with ```staticHandlebarsFiles``` helper. With this property you can move the files in a directory deeper (use case: Wordpress / CMS) like ```/assets```.

#### files (base.json)
All the necessary files to add (packaged) inside in the ```html <head/>``` rendered html file.

#### partials (base.json)
All the necessary partials to use to render the HTML.

#### helpers (base.json)
All the necessary helpers to use to render the HTML.

#### helpers%add / partails%add / files%add
Extend the ```json base.json``` file with additional partials, helpers and/or files for only this specific Handlebars template.

#### xxx
Use any properties that you like to add onto the context-object that will be used to render your Handlebars template. For example ```title``` can be defined inside the ```json``` file matching the filename of the template. Inside the template you will find ```{{title}}``` to position that value correctly in the ```html```. See [Handlebars](http://handlebarsjs.com) for more information about nesting context (properties).

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.9.0 - More restricted approach to streamline all options so it will also work in the sourceView + documentation updated
0.8.1 - Source-view feature added + example added  
0.7.1 - Cleanup of documentation + more generic approach to partials/helpers definition  
0.7.0 - Rewrote plugin to support more advanced usage of partials/helpers per page.  
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
* (?) detect duplicate definitions of context &amp; helpers/partials
* (?) use lowercase to detect wrong definitions of code or not useful?
* ! use target-directory for targetPath > check destination for that?
* Provide single json/context to all files inside Gruntfile.js