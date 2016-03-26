var gulp = require('gulp');
var path = require('path');
var del = require('del');
// var sass = require('gulp-sass');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var uglify= require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var grev=require('gulp-rev');
var revCollector=require('gulp-rev-collector');
var htmlmin = require('gulp-htmlmin');

var runSequence = require('gulp-run-sequence');

var inputDir = './src',
  outputDir = './build';

// 需要操作的文件
var source = {
  styleDir: path.join(inputDir, 'style'),
  styleFileDir: path.join(inputDir, 'style/*.less'),
  scriptDir: path.join(inputDir, 'script'),
  scriptFileDir: path.join(inputDir, 'script/*.js'),
  htmlFileDir: path.join(inputDir, 'html/*.*'),
  imageDir: path.join(inputDir,'images/*.*')
}

// 输出文件
var output = {
  cssDir: path.join(outputDir, 'static/css'),
  jsDir: path.join(outputDir, 'static/js'),
  htmlDir: path.join(outputDir, 'static/html'),
  imageDir: path.join(outputDir,'static/images'),

  revCssDir: path.join(outputDir, 'static/rev/css'),
  revJsDir: path.join(outputDir, 'static/rev/js'),
  revImageDir:  path.join(outputDir, 'static/rev/images'),
  revJSONFileDir: path.join(outputDir, 'static/rev/**/*.json'),

  htmlFile: path.join(outputDir, 'static/html/*.html'),
}

gulp.task('clean', function() {
  return del([outputDir]);
});
// sass
// gulp.task('sass', function () {
//   return gulp.src(source.styleFileDir)
//     .pipe(sass().on('error', sass.logError))
//     .pipe(gulp.dest(output.cssDir));
// });

// less
gulp.task('css', function () {
  return gulp.src(source.styleFileDir)
    .pipe(less())
    .pipe(minifycss())
    .pipe(grev())
    .pipe(gulp.dest(output.cssDir))
    .pipe(grev.manifest())
    .pipe(gulp.dest(output.revCssDir));
});
gulp.task('css:watch', function () {
  return gulp.watch(source.styleFileDir, ['css']);
});

//html
gulp.task('html', function () {
  return gulp.src(source.htmlFileDir)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(output.htmlDir));
});
gulp.task('html:watch', function () {
  return gulp.watch(source.htmlFileDir, ['html']);
});


//js压缩
gulp.task('js', function() {
    return gulp.src(source.scriptFileDir)
        // .pipe(concat('main.js'))    //合并所有js到main.js
        .pipe(uglify())    //压缩jsDir
        .pipe(grev())
        .pipe(gulp.dest(output.jsDir))  //输出
        .pipe(grev.manifest())
        .pipe(gulp.dest(output.revJsDir));
});
//图片
gulp.task('images', function () {
  return gulp.src(source.imageDir)
    .pipe(imagemin())
    .pipe(grev())
    .pipe(gulp.dest(output.imageDir))  //输出
    .pipe(grev.manifest())
    .pipe(gulp.dest(output.revImageDir));
});
//版本管理
gulp.task('rev', function () {
  return gulp.src([output.revJSONFileDir, output.htmlFile])
    .pipe(revCollector({
        replaceReved: true
    }))
    .pipe(gulp.dest(output.htmlDir));
});

gulp.task('watch', ['css:watch','html:watch'], function() {
  gulp.run('rev');
});
//默认
gulp.task('default', ['css','html','js','images'], function(){
    gulp.run('watch');
    gulp.run('rev');
});

gulp.task('build', function(cb) {
    runSequence('clean', ['css','html', 'js', 'images'], 'watch','rev', cb);
})