import gulp from 'gulp'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'

const sass = gulpSass(dartSass)

/*
 * Copy CSS
 */

const stylesFolder = 'docs/styles'

function publicSCSSFunction(): NodeJS.ReadWriteStream {
  return gulp
    .src(`${stylesFolder}/*.scss`)
    .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }))
    .pipe(gulp.dest(stylesFolder))
}

gulp.task('public-styles', publicSCSSFunction)

/*
 * Watch
 */

const watchFunction = () => {
  gulp.watch(`${stylesFolder}/*.scss`, publicSCSSFunction)
}

gulp.task('watch', watchFunction)

/*
 * Initialize default
 */

gulp.task('default', () => {
  publicSCSSFunction()
  watchFunction()
})
