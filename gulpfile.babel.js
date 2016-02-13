import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import browserify from 'browserify';
import debowerify from 'debowerify';
import source from 'vinyl-source-stream';
import mergeStream from 'merge-stream';
import { stream as wiredep } from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

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

// Styles
gulp.task('styles', ['wiredep'], () => {
    return gulp.src(Config.path.assets + '/styles/*.scss')
        .pipe($.plumber({
            errorHandler: $.notify.onError('Error: <%= error.message %>')
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }))
        .pipe($.autoprefixer({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
        }))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(Config.path.build + '/css'))
        .pipe(reload({
            stream: true
        }));
});

// Scripts
gulp.task('scripts', () => {
    var merged = mergeStream();
    var scripts = Config.scripts;
    scripts.forEach(function(file) {
        merged.add(browserify(Config.path.assets + '/scripts/' + file)
            .transform(debowerify)
            .bundle()
            .on('error', $.notify.onError(function(error) {
                return error.message;
            }))
            .pipe(source(file))
            .pipe(gulp.dest(Config.path.build + '/js')));
    });
    return merged;
});

// Lint
function lint(files, options) {
    return () => {
        return gulp.src(files)
            .pipe(reload({
                stream: true,
                once: true
            }))
            .pipe($.eslint(options))
            .pipe($.eslint.format())
            .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
            .on('error', $.notify.onError(function(error) {
                return 'Linting: ' + error.message;
            }));
    };
}
gulp.task('lint', lint(Config.path.assets + '/scripts/**/*.js'));

// Assets
gulp.task('assets', ['styles', 'scripts'], () => {
    return gulp.src([
            Config.path.build + '/js/**/*.js',
            Config.path.build + '/css/**/*.css'
        ], {
            base: Config.path.build
        })
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano()))
        .pipe(gulp.dest(Config.path.build));
});

// Images
gulp.task('images', () => {
    return gulp.src(Config.path.assets + '/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{
                cleanupIDs: false
            }]
        })))
        .pipe(gulp.dest(Config.path.build + '/img'));
});

// Fonts
gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}')
        .concat(Config.path.assets + '/fonts/**/*'))
        .pipe(gulp.dest(Config.path.build + '/fonts'));
});

// Clean
gulp.task('clean', del.bind(null, [Config.path.build]));

// Serve
gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
    browserSync({
        notify: false,
        port: Config.reload.port,
        proxy: Config.reload.proxy
    });

    gulp.watch([
        'app/Resources/**/*.html.twig',
        // 'src/**/Resources/views/**/*.html.twig',
        Config.path.build + '/js/**/*.js',
        Config.path.build + '/css/**/*.css',
        Config.path.build + '/img/**/*',
        Config.path.build + '/fonts/**/*'
    ]).on('change', reload);

    gulp.watch(Config.path.assets + '/styles/**/*.scss', ['styles']);
    gulp.watch(Config.path.assets + '/scripts/**/*.js', ['scripts']);
    gulp.watch(Config.path.assets + '/fonts/**/*', ['fonts']);
    gulp.watch(Config.path.assets + '/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
});

// Wiredep
gulp.task('wiredep', () => {
    gulp.src(Config.path.assets + '/styles/*.scss')
        .pipe(wiredep())
        .pipe(gulp.dest(Config.path.assets + '/styles'));
});

// Build
gulp.task('build', ['lint', 'assets', 'images', 'fonts'], () => {
    return gulp.src(Config.path.build + '/**/*').pipe($.size({
        title: 'build',
        gzip: true
    }));
});

// Default task
gulp.task('default', ['clean'], () => {
    gulp.start('build');
});
