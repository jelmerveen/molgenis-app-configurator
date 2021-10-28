const ZipPlugin = require('zip-webpack-plugin')
const packageJson = require('./package.json')
const GenerateJsonWebpackPlugin = require('generate-json-webpack-plugin')
const pkgVersion = packageJson.version
const pkgName = packageJson.name

const PROXY_TARGET = 'https://bbmri-acc.gcc.rug.nl' // 'https://master.dev.molgenis.org'

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
      new GenerateJsonWebpackPlugin('config.json', {
        name: packageJson.name,
        label: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
        apiDependency: 'v2',
        includeMenuAndFooter: true,
        runtimeOptions: {}
      }, null, 4),
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
      }
    }
  }
}
