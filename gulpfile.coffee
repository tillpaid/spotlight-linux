gulp = require 'gulp'
coffee = require 'gulp-coffee'

coffeeSrc = './src/*.coffee'
jsPublic = './public/'

gulp.task 'coffee', ->
    gulp.src coffeeSrc
        .pipe coffee({bare: true})
        .pipe gulp.dest jsPublic

gulp.task 'watchCoffee', ->
    gulp.watch coffeeSrc, ['coffee']
