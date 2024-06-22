import * as esbuild from 'esbuild'

const config = {
  entryPoints: ['app/javascript/*.js'],
  bundle: true,
  sourcemap: process.env.RAILS_ENV !== 'production',
  minify: process.env.RAILS_ENV === 'production',
  outdir: 'app/assets/builds',
  publicPath: '/assets',
  loader: {
    '.png': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.eot': 'dataurl',
    '.ttf': 'dataurl',
    '.svg': 'dataurl',
  }
}

if (process.argv.includes('--watch')) {
  let context = await esbuild.context({...config, logLevel: 'info'})
  context.watch()
} else {
  esbuild.build(config)
}