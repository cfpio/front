const path = require('path')
const gulp = require('gulp')
const conf = require('./conf')

const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del', 'lodash', 'bower-config'],
  rename: {lodash: '_', 'bower-config': 'bowerConfig'}
})

gulp.task('partials', () => {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'io.cfp.front',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'))
})

gulp.task('html', ['inject', 'partials'], () => {
  const partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), {read: false})
  const partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  }

  // Add .*/ prefix to support gulp-filter@4
  const htmlFilter = $.filter('.*/*.html', {restore: true})
  const jsFilter = $.filter('.*/**/*.js', {restore: true})
  const cssFilter = $.filter('.*/**/*.css', {restore: true})

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe($.useref())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense})).on('error', conf.errorHandler('Uglify'))
    .pipe($.rev())
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    // .pipe($.sourcemaps.init())
    .pipe($.replace('../vendor/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
    .pipe($.replace('../vendor/font-awesome/fonts', '../fonts'))
    .pipe($.cssnano())
    .pipe($.rev())
    // .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({title: path.join(conf.paths.dist, '/'), showFiles: true}))
})

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', () => {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')))
})

gulp.task('other', () => {
  const fileFilter = $.filter((file) => {
    return file.stat.isFile()
  })

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
})

// bower dependencies to copy unchanged in dist
gulp.task('no-bundle', () => {
  const cwd = process.cwd()
  const bowerDirectory = path.join(cwd, $.bowerConfig.read(cwd).directory)
  const bowerFiles = $.mainBowerFiles()
  $._.each(conf.noBundle, function(target, dependency) {
    gulp.src($._.filter(bowerFiles, function(file) {
      return file.startsWith(path.join(bowerDirectory, dependency))
    })).pipe(gulp.dest(path.join(conf.paths.dist, target)));
  })
})

gulp.task('clean', () => {
  return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/'), path.join(conf.paths.coverage, '/')])
})

gulp.task('build', ['html', 'fonts', 'other', 'no-bundle'])
