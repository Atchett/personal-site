// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
//const sass = require("gulp-sass");
const prefix = require("gulp-autoprefixer");
const stripCssComments = require("gulp-strip-css-comments");
const csso = require("gulp-csso");
//const rename = require("gulp-rename");
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
  images: dir.src + "/images/**/*.*",
  fonts: dir.src + "/assets/webfonts/*"
};

const distFiles = {
  css: dir.dist + "/assets/css",
  js: dir.dist + "/assets/js",
  html: dir.dist,
  images: dir.dist + "/images",
  fonts: dir.dist + "/assets/webfonts"
};

// // SASS task
// function scssTask() {
//   return (
//     src(srcFiles.scssPath)
//       //compile sass
//       .pipe(
//         sass({
//           outputStyle: "nested",
//           precision: 10,
//           includePaths: ["."],
//           onError: console.error.bind(console, "Sass error:")
//         })
//       )
//       // autoprefix
//       .pipe(prefix("last 2 versions"))
//       //push .css to output
//       //.pipe(dest(distFiles.css))
//       // remove comments for minify
//       .pipe(
//         stripCssComments({
//           preserve: true
//         })
//       )
//       // minify
//       .pipe(
//         csso({
//           restructure: false
//         })
//       )
//       // rename .min
//       .pipe(rename({ suffix: ".min" }))
//       // output .min file
//       .pipe(dest(distFiles.css))
//   );
// }
// exports.scssTask = scssTask;

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
      //push to src styles folder
      //.pipe(dest(distFiles.css))
      //push unminified CSS to the output path
      //.pipe(dest(distFiles.css))
      // Minify the file
      .pipe(
        csso({
          restructure: false
        })
      )
      .pipe(
        purgecss({
          content: [srcFiles.htmlPath]
        })
      )
      // change the filename to add min
      //.pipe(rename({ suffix: ".min" }))
      //push to src styles folder
      // .pipe(
      //   dest(dir.src + '/style')
      // )
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
      // change the filename to add min
      //.pipe(rename({ suffix: ".min" }))
      // Output
      .pipe(dest(distFiles.js))
  );
}
exports.scriptsTask = scriptsTask;

// essentially copy the fonts across
function fontsTask() {
  return src(srcFiles.fonts).pipe(dest(distFiles.fonts));
}
exports.fontsTask = fontsTask;

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
  parallel(cssTask, scriptsTask, imageTask, fontsTask),
  htmlTask
);
