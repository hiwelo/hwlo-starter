// Requires
var gulp = require('gulp');

// Plugins inclusion
var plugins = require('gulp-load-plugins')();

// Paths
var source = './src',
    prod = './dist';


// -----------------------------
// Build task : css js img fonts
// -----------------------------

// CSS Task = LESS & CSSO & autoprefixer
gulp.task('css', function () {
  return gulp.src(source + '/assets/css/styles.less')
    .pipe(plugins.less())
    .pipe(plugins.autoprefixer())
    .pipe(plugins.csso())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(prod + '/assets/css/'));
});

// JS Task = concatenation and copying, don't forget to add vendors
gulp.task('js', function () {
  return gulp.src([
    source + '/assets/js/*.js',
    source + '/assets/vendor/jquery/dist/jquery.min.js' // jQuery vendor
  ])
    .pipe(plugins.concat('global.min.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(prod + '/assets/js/'));
});

// IMG Task = optimization & copying
gulp.task('img', function () {
  return gulp.src(source + '/assets/img/*.{png,jpg,jpeg,gif,svg}')
    .pipe(plugins.imagemin({
      svgoPlugins: [{
        removeViewBox: false
      }, {
        cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest(prod + '/assets/img'));
});

// FONT Task = file copying (src -> prod)
gulp.task('fonts', function () {
  return gulp.src(source + '/assets/fonts/*')
    .pipe(gulp.dest(prod + '/assets/fonts'));
});


// -----------------
// TASKS declaration
// -----------------

gulp.task('build', ['css', 'js', 'img', 'fonts']);
gulp.task('watch', function () {
  gulp.watch(source + '/assets/css/*.less', ['css']);
  gulp.watch(source + '/assets/js/*.js', ['js']);
});
gulp.task('default', ['build']);
