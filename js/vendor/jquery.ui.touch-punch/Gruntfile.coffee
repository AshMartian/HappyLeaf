module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    src_path: "src"
    dist_path: "dist"
    copy:
      dist:
        files: [
          {expand: true, cwd: "<%= src_path %>", src: ["*.js"], dest: "<%= dist_path %>"}
        ]
    uglify:
      options:
        mangle: false
      dist:
        files:
          "dist/<%= pkg.name %>.min.js": ["dist/<%= pkg.name %>.js"]

  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-uglify"

  grunt.registerTask "dist", ["copy:dist","uglify:dist"]