module.exports = function(grunt) {

  var globalConfig = {
    themeDir: 'themes/imu5'
  };

  // Project configuration.
  grunt.initConfig({

    globalConfig: globalConfig,
    pkg: grunt.file.readJSON('package.json'),
    
    //compile the sass

    compass: {
      dist: {                   // Target
        options: {              // Target options
          sassDir: ['<%=globalConfig.themeDir %>/scss', 'division-project/scss'],
          cssDir: '<%=globalConfig.themeDir %>/css',
          environment: 'production'
        }
      }
    },

    //concat all the files into the build folder

    concat: {
      css: {
        src: ['<%=globalConfig.themeDir %>/css/*.css', 'division-project/css/*.css'],
        dest: '<%=globalConfig.themeDir %>/css/master.css'
      },
      js:{
        src: ['<%=globalConfig.themeDir %>/js/*.js', 'division-project/js/*.js'],
        dest: '<%=globalConfig.themeDir %>/build/src/main_concat.js'
      }
    },

    //minify those concated files
    //toggle mangle to leave variable names intact

    uglify: {
      options: {
        mangle: true
      },
      my_target:{
        files:{
        '<%=globalConfig.themeDir %>/build/build.js': ['<%=globalConfig.themeDir %>/build/src/main_concat.js'],
        }
      }
    },

    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: '<%=globalConfig.themeDir %>/images/',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%=globalConfig.themeDir %>/build/images/'
        }]
      }
    },

    watch: {
      scripts: {
        files: ['<%=globalConfig.themeDir %>/js/*.js', '<%=globalConfig.themeDir %>/js/**/*.js'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: true,
        }
      },
      css: {
        files: ['<%=globalConfig.themeDir %>/scss/*.scss', 
                '<%=globalConfig.themeDir %>/scss/**/*.scss',
                'division-project/scss/*.scss',
                'division-project/scss/**/*.scss'
                ],
        tasks: ['compass'],
        options: {
          spawn: true,
        }
      }
    },

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-watch');

  // Default task(s).
  // Note: order of tasks is very important
  grunt.registerTask('default', ['compass', 'concat', 'uglify', 'imagemin', 'simple-watch']);

};