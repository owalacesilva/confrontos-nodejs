import mincer from 'mincer'

mincer.logger.use(console)

// Create an environment
var environment = new mincer.Environment(__dirname)

// Enable source map support
environment.enable('source_maps')

// Configure environment load paths (where to find assets)
environment.appendPath('assets/javascripts')
environment.appendPath('assets/stylesheets')
environment.appendPath('assets/images')
environment.appendPath('../lib')
environment.appendPath('../vendor')

environment.enable('autoprefixer')

if (process.env.NODE_ENV === 'production') {
  // Enable JS and CSS compression
  environment.jsCompresor = 'uglify'
  environment.cssCompresor = 'csswring'
  environment = environment.index
}

mincer.MacroProcessor.configure(['.js', '.css'])

export default environment
