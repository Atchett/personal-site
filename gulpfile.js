// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const prefix = require("gulp-autoprefixer");
const stripCssComments = require("gulp-strip-css-comments");
const csso = require("gulp-csso");
const uglify = require("gulp-uglify");
const del = require("del");
const cache = require("gulp-cache");
const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const purgecss = require("gulp-purgecss");

//filepaths
const dir = {
  src: "./src",
  dist: "./dist"
};

const srcFiles = {
  scssPath: dir.src + "/assets/sass/*.scss",
  cssPath: dir.src + "/assets/css/**/*.css",
  jsPath: dir.src + "/assets/js/**/*.js",
  htmlPath: dir.src + "/**/*.html",
  images: dir.src + "/images/**/*.*"
};

const distFiles = {
  css: dir.dist + "/assets/css",
  js: dir.dist + "/assets/js",
  html: dir.dist,
  images: dir.dist + "/images"
};

function cssTask() {
  return (
    src(srcFiles.cssPath)
      // Auto-prefix css styles for cross browser compatibility
      .pipe(prefix("last 2 versions"))
      // remove the comments
      .pipe(
        stripCssComments({
          preserve: true
        })
      )
      // Minify the file
      .pipe(
        csso({
          restructure: false
        })
      )
      // remove any unnecessary css
      .pipe(
        purgecss({
          content: [srcFiles.htmlPath]
        })
      )
      // Output
      .pipe(dest(distFiles.css))
  );
}
exports.cssTask = cssTask;

function scriptsTask() {
  return (
    src(srcFiles.jsPath)
      // Minify the file
      .pipe(uglify())
      // Output
      .pipe(dest(distFiles.js))
  );
}
exports.scriptsTask = scriptsTask;

function imageTask() {
  return src(srcFiles.images)
    .pipe(
      cache(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 })
        ])
      )
    )
    .pipe(dest(distFiles.images));
}
exports.imageTask = imageTask;

function htmlTask() {
  return src(srcFiles.htmlPath)
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    )
    .pipe(dest(distFiles.html));
}
exports.htmlTask = htmlTask;

function cleanTask() {
  return del([dir.dist]);
}
exports.cleanTask = cleanTask;

function clearCacheTask() {
  return cache.clearAll();
}
exports.clearCacheTask = clearCacheTask;

exports.default = series(
  cleanTask,
  clearCacheTask,
  parallel(cssTask, scriptsTask, imageTask),
  htmlTask
);
