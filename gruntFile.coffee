
module.exports = (grunt) ->

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  # Core tasks
  tasks = ['coffee', 'uglify']

  grunt.initConfig
    coffee:
      main:
        options:
          expand: yes
          join: yes
        files:
          'dist/autocomplete.js': [
            'src/header.coffee'
            'src/autocomplete.collection.coffee'
            'src/autocomplete.childview.coffee'
            'src/autocomplete.collectionview.coffee'
            'src/autocomplete.behavior.coffee'
          ]
    uglify:
      dist:
        files:
          'dist/autocomplete.min.js': 'dist/autocomplete.js'
    watch:
      files: [
        'src/*',
      ],
      tasks: tasks

  grunt.registerTask 'default', tasks
