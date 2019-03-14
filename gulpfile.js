var gulp = require('gulp');
var pump = require('pump');

// gulp plugins and utils
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var beeper = require('beeper');
var del = require('del');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-function');
var cssnano = require('cssnano');
var customProperties = require('postcss-custom-properties');
var easyimport = require('postcss-easy-import');

var nodemonServerInit = function () {
    livereload.listen(1234);
};

function handleError(done) {
    
    return function (err) {
        if (err) {
            console.log(err)
            beeper();
        }
        return done(err);
    };
}

// clean "assets" directory
gulp.task('clean:assets/dist', function () {
    return del( 'assets/dist/' );
});

gulp.task('css', function (done) {
    var processors = [
        easyimport,
        customProperties,
        colorFunction(),
        autoprefixer({browsers: ['last 3 versions']}),
        cssnano()
    ];

    pump([
        gulp.src('assets/css/*.css'),
        sourcemaps.init(),
        postcss(processors),
        sourcemaps.write('.'),
        gulp.dest('assets/dist/'),
        livereload()
    ], handleError(done));
});

gulp.task('js', function (done) {
    var jsFilter = filter(['**/*.js'], {restore: true});

    pump([
        gulp.src('assets/js/*.js'),
        sourcemaps.init(),
        jsFilter,
        uglify(),
        jsFilter.restore,
        sourcemaps.write('.'),
        gulp.dest('assets/dist/'),
        livereload()
    ], handleError(done));
});

gulp.task('watch', function () {
    livereload.listen(1234);
    gulp.watch('assets/css/**', gulp.series('css') );
    gulp.watch('assets/js/*.js', gulp.series('js') );
});

gulp.task('zip', gulp.series('css', 'js', function (done) {
    var targetDir = 'assets/dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    pump([
        gulp.src([
            '**',
            '!node_modules', '!node_modules/**',
            '!assets/dist', '!assets/dist/**'
        ]),
        zip(filename),
        gulp.dest(targetDir)
    ], handleError(done));
}));


gulp.task('build',  gulp.series('clean:assets/dist','css', 'js') );

gulp.task('default', gulp.series('build', 'watch') );

gulp.task('generate', gulp.series( 'css', 'js' ) );