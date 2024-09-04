import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
const stylesFolder = 'docs/styles';
function publicSCSSFunction() {
    return gulp
        .src(`${stylesFolder}/*.scss`)
        .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }))
        .pipe(gulp.dest(stylesFolder));
}
gulp.task('public-styles', publicSCSSFunction);
const watchFunction = () => {
    gulp.watch(`${stylesFolder}/*.scss`, publicSCSSFunction);
};
gulp.task('watch', watchFunction);
gulp.task('default', () => {
    publicSCSSFunction();
    watchFunction();
});
