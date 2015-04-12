"use strict"

var gulp = require("gulp")
  , $ = require("gulp-load-plugins")()
  , del = require("del")

gulp.task("css", ["css:clean"], function () {
})

gulp.task("css:clean", function (done) {
  del(["dist/css"], done)
})

gulp.task("js", ["js:clean"], function () {
})

gulp.task("js:clean", function (done) {
  del(["dist/js"], done)
})

gulp.task("img", ["img:clean"], function () {
  return gulp.src("img/**")
    .pipe($.plumber())
    .pipe($.changed("dist/img"))
    .pipe(gulp.dest("dist/img"))
    .pipe($.size({
      title: "img"
    , showFiles: true
    }))
})

gulp.task("img:clean", function (done) {
  del(["dist/img"], done)
})

gulp.task("html", ["html:clean"], function () {
  var gulpsmith = require("gulpsmith")
    , _ = require("lodash")
    , $$ = require("load-metalsmith-plugins")()

  return gulp.src("html/**/*.{md,html}")
    .pipe($.plumber())
    .pipe($.frontMatter().on("data", function (file) {
      _.assign(file, file.frontMatter)
    }))
    .pipe(gulpsmith()
      .use($$.markdown())
      .use($$.permalinks(":title"))
      .use($$.layouts({
        engine: "ejs"
      , directory: "tpl"
      }))
      .use($$.inPlace({
        engine: "ejs"
      }))
    )
    .pipe($.minifyHtml())
    .pipe(gulp.dest("dist"))
    .pipe($.livereload())
    .pipe($.size({
      title: "html"
    , showFiles: true
    }))
})

gulp.task("html:clean", function (done) {
  del(["dist/**/*.html"], done)
})

gulp.task("copy", function () {
  return gulp.src([
    "favicon.ico"
  ], {
    base: "./"
  })
    .pipe($.plumber())
    .pipe($.changed("dist"))
    .pipe(gulp.dest("dist"))
})

gulp.task("meta", ["meta:clean"], function (done) {
  var _ = require("lodash")
    , async = require("async")
    , humans = require("humans-generator")
    , robots = require("robots-generator")

  async.parallel([
    function (next) {
      humans(_.extend(require("./humans.json"), {
        out: "dist/humans.txt"
      , callback: next
      }))
    }
  , function (next) {
      robots(_.extend(require("./robots.json"), {
        out: "dist/robots.txt"
      , callback: next
      }))
    }
  ], done)
})

gulp.task("meta:clean", function (done) {
  del(["dist/humans.txt", "dist/robots.txt"], done)
})

gulp.task("build", [
  "css"
, "js"
, "img"
, "html"
, "copy"
, "meta"
])

gulp.task("default", ["build"])

gulp.task("watch", ["build"], function () {
  $.livereload.listen()

  gulp.watch("css/**/*.css", ["css"])
  gulp.watch("js/**/*.js", ["js"])
  gulp.watch([
    "tpl/**/*.html"
  , "html/**/*.{md,html}"
  ], ["html"])
})

gulp.task("serve", ["watch"], function () {
  return gulp.src("dist")
    .pipe($.plumber())
    .pipe($.webserver({
      open: true
    , livereload: true
    }))
})

gulp.task("deploy", ["deploy:clean", "build"], function () {
  return gulp.src("dist/**/*")
    .pipe($.plumber())
    .pipe($.ghPages({
      remoteUrl: "git@github.com:radio-modem/radio-modem.github.io.git"
    , branch: "master"
    , cacheDir: ".tmp"
    , force: true
    }))
})

gulp.task("deploy:clean", function (done) {
  del([".tmp"], done)
})
