import gulp from "gulp";
import changed from "gulp-changed";
import minify from "gulp-minify";
const publicJavascriptsDestination = "docs/scripts";
const publicJavascriptsMinFunction = () => {
    return gulp.src("src/scripts/*.js", { allowEmpty: true })
        .pipe(changed(publicJavascriptsDestination, {
        extension: ".min.js"
    }))
        .pipe(minify({ noSource: true, ext: { min: ".min.js" } }))
        .pipe(gulp.dest(publicJavascriptsDestination));
};
gulp.task("public-javascript-min", publicJavascriptsMinFunction);
const publicStylesDestination = "docs/styles";
const publicStylesCopyFunction = () => {
    return gulp.src("src/styles/*.css", { allowEmpty: true })
        .pipe(gulp.dest(publicStylesDestination));
};
gulp.task("public-styles", publicStylesCopyFunction);
const watchFunction = () => {
    gulp.watch("src/scripts/*.js", publicJavascriptsMinFunction);
    gulp.watch("src/styles/*.css", publicStylesCopyFunction);
};
gulp.task("watch", watchFunction);
gulp.task("default", () => {
    publicJavascriptsMinFunction();
    publicStylesCopyFunction();
    watchFunction();
});
