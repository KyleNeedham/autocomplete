
module.exports = function(grunt)
{
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Core tasks
  var tasks = ['coffee', 'jasmine', 'uglify'];

  grunt.initConfig({
    coffee: {
      main: {
        options: {
          expand: true,
          join: true
        },
        files: {
          'dist/autocomplete.js': [
            'src/header.coffee',
            'src/autocomplete.collection.coffee',
            'src/autocomplete.childview.coffee',
            'src/autocomplete.collectionview.coffee',
            'src/autocomplete.behavior.coffee'
          ]
        }
      },
      specs: {
        files: [{
          expand: true,
          cwd: 'spec/coffeescripts/',
          src: '*.spec.coffee',
          dest: 'spec/javascripts/',
          ext: '.spec.js'
        }]
      }
    },
    jasmine: {
      src: [
        'node_modules/jquery/dist/jquery.js',
        'node_modules/underscore/underscore.js',
        'node_modules/backbone/backbone.js',
        'node_modules/backbone.marionette/lib/backbone.marionette.js',
        'dist/autocomplete.js'
      ],
      options: {
        specs: 'spec/javascripts/**/*.spec.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/autocomplete.min.js': 'dist/autocomplete.js'
        }
      }
    },
    watch: {
      files: [
        'src/*',
        'spec/coffeescripts/**/*.spec.coffee'
      ],
      tasks: tasks
    }
  });

  grunt.registerTask('default', tasks);
  grunt.registerTask('travis', ['coffee', 'jasmine']);
};
