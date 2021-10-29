const ZipPlugin = require('zip-webpack-plugin')
const packageJson = require('./package.json')
const GenerateJsonWebpackPlugin = require('generate-json-webpack-plugin')
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const pkgVersion = packageJson.version
const pkgName = packageJson.name

const PROXY_TARGET = 'https://jelmer.gcc.rug.nl' // 'https://master.dev.molgenis.org'

module.exports = {
  runtimeCompiler: true,
  outputDir: 'dist',
  publicPath: process.env.NODE_ENV === 'production'
    ? '/plugin/app/' + pkgName
    : '/',
  chainWebpack: config => {
    config.resolve.symlinks(false)
  },
  configureWebpack: config => {
    config.plugins.push(
      new MonacoEditorPlugin({
        publicPath: process.env.NODE_ENV === 'production'
          ? '/plugin/app/' + pkgName + '/js/' // we need to change this path for webworkers to work on molgenis app
          : '/',
        languages: ['json']
      }),
      new GenerateJsonWebpackPlugin('config.json', {
        name: packageJson.name,
        label: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
        apiDependency: 'v2',
        includeMenuAndFooter: true,
        runtimeOptions: {}
      }, null, 4),
      new CopyPlugin({
        patterns: [
          { from: 'js/*.js' } // this is a hack, because we can't load js files from the home dir as app
        ]
      }),
      new ZipPlugin({
        filename: `${pkgName}.v${pkgVersion}`
      })
    )
  },
  devServer: {
    // In CI mode, Safari cannot contact "localhost", so as a workaround, run the dev server using the jenkins agent pod dns instead.
    host: process.env.JENKINS_AGENT_NAME || 'localhost',
    // Used to proxy a external API server to have someone to talk to during development
    proxy: process.env.NODE_ENV !== 'development' ? undefined : {
      '/login': {
        target: PROXY_TARGET,
        changeOrigin: true
      },
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true
      },
      '/logout': {
        target: PROXY_TARGET,
        changeOrigin: true
      },
      '^/theme': {
        target: PROXY_TARGET,
        keepOrigin: true
      },
      '^/@molgenis-ui': {
        target: PROXY_TARGET,
        keepOrigin: true
      }
    }
  }
}
