# gulp-symfony

Symfony assets management with Gulp - made simple.

## About
Speed up your frontend workflow while developing Symfony apps with tools like [Gulp](http://gulpjs.com), [Bower](http://bower.io), [Browserify](http://browserify.org), [Sass](http://sass-lang.com), [BrowserSync](https://browsersync.io) and more. Inspired by and partially copied from [Yeoman](http://yeoman.io) [Web app generator](https://github.com/yeoman/generator-gulp-webapp).

## Features
- Livereload with [BrowserSync](https://browsersync.io)
- CSS with Sass, Autoprefixer, sourcemaps for developing and CSSNano for minification
- JavaScript with [ESLint](http://eslint.org) and [Browserify](http://browserify.org) + [Debowerify](https://github.com/eugeneware/debowerify) for bundling bower components.
- Image optimalization with [imagemin](https://github.com/imagemin/imagemin)

## Installation
Download this repository to your Symfony project folder. Assets are located under app/assets folder, feel free to change if needed.

Install Gulp and Bower globally
```
$ npm install -g gulp bower
```

Install dependencies
```
$ npm install
```

## Configuration
Inside gulpfile you can find Config variable.
```javascript
var Config = {
    path: {
        'assets': 'app/assets',
        'build': 'web/assets'
    },
    scripts: ['app.js'],
    reload: {
        'proxy': 'local.dev/app_dev.php',
        'port': 3000
    }
};
```
`path`: files location, `assets` for source files and `build` for build

`scripts`: you can define more than just one script if you need admin.js or whatever

`reload`: browsersync options, set proxy to your local url

**Important!** Build folder is cleaned before every build, so do not change this folder to web or any other. You don't want to lose it. :)

## Usage
Install vendors with Bower (default Bootstrap 4)
```
$ bower install
```
`wiredep` task automatically inject files, using main entry inside bower.json, for overriding main entry see [wiredep docs](https://github.com/taptapship/wiredep/tree/master#bower-overrides)

For imported scss files use name prefixed with underscore, because Sass does not compile those files.

Gulp tasks
```
$ gulp -T
```

Build
```
$ gulp
```

Develop
```
$ gulp serve
```

For more information check docs of the tools used in gulpfile.

## Symfony
Linking in Twig
```html
<link rel="stylesheet" href="{{ asset('assets/css/app.css') }}">
<script src="{{ asset('assets/js/app.js') }}"></script>
```

**Note**
By default BrowserSync reloads only if views in app folder changed, you can enable this also for bundle views. Just simply [uncomment this line](https://github.com/makao/gulp-symfony/blob/master/gulpfile.babel.js#L131) in gulpfile.
```javascript
// 'src/**/Resources/views/**/*.html.twig',
```