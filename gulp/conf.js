/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */

const gutil = require('gulp-util')

/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  coverage: 'coverage'
}

/**
 *  Wiredep is the lib which inject bower dependencies in your project
 *  Mainly used to inject script tags in the index.html but also used
 *  to inject css preprocessor deps and js files in karma
 */
exports.wiredep = {
  exclude: [/jquery/, /angular-locale_[^.]+\.js/, /\/bootstrap\.js$/, /\/bootstrap-sass\/.*\.js/, /\/bootstrap\.css/],
  directory: 'vendor'
}

/**
 * Bower dependencies that must not be bundled but copied as is in dist. Key is the bower dependency name, value is
 * the sub dist directory to copy files to.
 */
exports.noBundle = {
  'angular-i18n': 'l10n'
}

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = (title) => {
  return (error) => {
    gutil.log(gutil.colors.red('[' + title + ']'), error.toString())
    this.emit('end')
  }
}
