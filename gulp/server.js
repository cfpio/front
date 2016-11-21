const path = require('path')
const gulp = require('gulp')
const conf = require('./conf')

const browserSync = require('browser-sync')
const browserSyncSpa = require('browser-sync-spa')

const util = require('util')

function browserSyncInit(baseDir, browser) {
  browser = browser === undefined ? 'default' : browser

  let routes = null
  if (baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
    routes = {
      '/vendor': 'vendor',
      '/l10n': 'vendor/angular-i18n'
    }
  }

  const server = {
    baseDir: baseDir,
    routes: routes
  }

  /*
   * You can add a proxy to your backend by uncommenting the line below.
   * You just have to configure a context which will we redirected and the target url.
   * Example: $http.get('/users') requests will be automatically proxified.
   *
   * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.9.0/README.md
   */
  server.middleware = (req, res, next) => {
    if (req.url === '/infra') {
      res.writeHead(200, {
        'X-API-Server': 'https://api.cfp.io',
        'X-Authentication-Server': 'https://auth.cfp.io'
        // 'X-API-Server': 'http://dev-front.cfp.io:8080',
        // 'X-Authentication-Server': 'http://dev-front.cfp.io:46001'
      })
      res.end()
    }
    else {
      next()
    }
  }

  browserSync.instance = browserSync.init({
    startPath: '/',
    server: server,
    browser: browser,
    open: false
  })
}

browserSync.use(browserSyncSpa({
  selector: '[ng-app]'// Only needed for angular apps
}))

gulp.task('serve', ['watch'], function() {
  browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src])
})

gulp.task('serve:dist', ['build'], function() {
  browserSyncInit(conf.paths.dist)
})

gulp.task('serve:e2e', ['inject'], function() {
  browserSyncInit([conf.paths.tmp + '/serve', conf.paths.src], [])
})

gulp.task('serve:e2e-dist', ['build'], function() {
  browserSyncInit(conf.paths.dist, [])
})
