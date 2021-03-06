'use strict';
/*
 * Gulp components
 */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import gSync from 'gulp-sync';
import browserSync from 'browser-sync';


/*
 * Project configuration
 */
const project = {
  name: '', // project name for gulp-notify
  url: 'http://', // project dev url
  preprocessor: {
    css: 'less', // choose 'less' or 'sass'
    js: 'es2015', // choose 'es2015' or another installed babel preset
  },
  sync: {
    watch: false, // browserSync activation
    proxyMode: true, // browserSync proxy mode (see project.url for the url)
  },
  conf: {
    suffix: '.min', // suffix add to prod concat & minified files
    globalJSFile: 'global', // name of the concat JS final file (w/o suffix)
    // gulp-autoprefixer configuration
    autoprefixer: ['> 1%', 'Firefox ESR', 'last 2 versions', 'not ie <= 10'],
    // gulp-uglify configuration
    uglify: {
      preserveComments: 'license',
    },
    // gulp-imagemin configuration
    imagemin: {
      svgoPlugins: [
        {
          removeViewBox: false,
        },
        {
          cleanupIDs: false
        },
      ],
    },
    // gulp-iconfont configuration
    iconfont: {
      fontName: 'icons',
      appendUnicode: true,
      formats: ['woff', 'woff2'],
      timestamp: Math.round(Date.now() / 1000),
    }
  },
};

const paths = {
  root: './',
  domFiles: [
    './*.php',
    './**/*.php',
    './*.html',
    './**/*.html',
  ],
  src: {
    root: './assets/src',
    styles: {
      root: './assets/src/css/',
      less: './assets/src/css/styles.less',
      lessFiles: './assets/src/css/*.less',
      sass: './assets/src/css/styles.scss',
      sassFiles: './assets/src/css/*.scss',
    },
    scripts: './assets/src/js/*.js',
    images: './assets/src/img/*.{png,jpg,jpeg,gif,svg}',
    fonts: './assets/src/fonts/*.{woff,woff2}',
    icons: './assets/src/icons/*.svg',
  },
  vendors: {
    root: './assets/node_modules',
    list: [
      './assets/node_modules/jquery/dist/jquery.min.js',
      './assets/node_modules/jquery-initialcaps/dist/js/jquery-initialcaps.js',
    ]
  },
  dist: {
    root: './assets/dist',
    styles: './assets/dist/css',
    cssFiles: './assets/dist/css/*.css',
    cssMinFiles: `./assets/dist/css/*${project.conf.suffix}.css`,
    scripts: './assets/dist/js',
    images: './assets/dist/img',
    fonts: './assets/dist/fonts',
  },
};


/*
 * Gulp components init
 */

const $ = gulpLoadPlugins();
const gulpSync = gSync(gulp);
browserSync.create();


/*
 * Error task
 */

const onError = (err) => {
  console.log(err);
  $.notify.onError({
    title: `Gulp ${project.name}`,
    subtitle: 'Erreur de compilation',
    message: 'Erreur : <%= error.message %>',
  })(err);
  this.emit('end');
};


/*
 * Gulp tasks: css, js, img, fonts, icons
 */

// Less task: less compilation + (src -> dist)
gulp.task('less', () => {
  return gulp.src(paths.src.styles.less)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.less())
    .pipe(gulp.dest(paths.dist.styles));
});

// Sass task: sass compilation + (src -> dist)
gulp.task('sass', () => {
  return gulp.src(paths.src.styles.sass)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.sass())
    .pipe(gulp.dest(paths.dist.styles));
});

// CSS task: autoprefixer + css optimizer + rename (.min)
gulp.task('css', () => {
  let source = [
    paths.dist.cssFiles,
    `!${paths.dist.cssMinFiles}`,
  ];

  return gulp.src(source)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.autoprefixer({
      browsers: project.conf.autoprefixer,
    }))
    .pipe($.csso())
    .pipe($.rename({
      suffix: project.conf.suffix,
    }))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(browserSync.stream());
});

// JS task: babel + concat + uglify + (src -> dist)
gulp.task('js', () => {
  return gulp.src(paths.src.scripts)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: [project.preprocessor.js],
    }))
    .pipe($.concat(`${project.conf.globalJSFile}${project.conf.suffix}.js`))
    .pipe($.uglify(project.conf.uglify))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe(browserSync.stream());
});

// Image task: imagemin + (src -> dist)
gulp.task('img', () => {
  return gulp.src(paths.src.images)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.newer(paths.dist.images))
    .pipe($.imagemin(project.conf.imagemin))
    .pipe(gulp.dest(paths.dist.images));
});

// Fonts task: (src -> dist)
gulp.task('fonts', () => {
  return gulp.src(paths.src.fonts)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.newer(paths.dist.fonts))
    .pipe(gulp.dest(paths.dist.fonts))
    .pipe($.filesize());
});

// Icons task: iconfont (svg to woff) + (src -> dist)
gulp.task('icons', () => {
  return gulp.src(paths.src.icons)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.iconfont(project.conf.iconfont))
    .on('glyphs', (glyphs, options) => {
      console.log(glyphs, options);
    })
    .pipe(gulp.dest(paths.dist.fonts));
});

// JS vendor task: concat + uglify + (src -> dist)
gulp.task('vendor', () => {
  return gulp.src(paths.vendors.list)
    .pipe($.plumber({
      errorHandler: onError,
    }))
    .pipe($.concat(`vendor${project.conf.suffix}.js`))
    .pipe($.uglify(project.conf.uglify))
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe(browserSync.stream());
});


/*
 * Watch task
 */

gulp.task('watch', () => {
  // browserSync watch task
  if (project.sync.watch === true && project.sync.proxyMode === true) {
    browserSync.init({
      proxy: project.url,
    });
  } else if (project.sync.watch === true && project.sync.proxyMode === false) {
    browserSync.init({
      server: {
        baseDir: paths.root,
      },
    });
  }

  // Less or Sass watch task
  if (project.preprocessor.css === 'less') {
    gulp.watch(paths.src.styles.lessFiles, gulpSync.sync(['less', 'css']));
  } else if (project.preprocessor.css === 'sass') {
    gulp.watch(paths.src.styles.sassFiles, gulpSync.sync(['sass', 'css']));
  }

  // JS watch task
  gulp.watch(paths.src.scripts, ['js']);

  // DOM files watch task for browserSync
  gulp.watch(paths.domFiles).on('change', browserSync.reload);
});


/*
 * Global tasks
 */

gulp.task('build', gulpSync.sync([project.preprocessor.css, ['css', 'js', 'vendor', 'img', 'fonts', 'icons']]));
gulp.task('work', gulpSync.sync(['build', 'watch']));
gulp.task('start', ['work']);
gulp.task('default', ['build']);
