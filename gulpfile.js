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
const watchFunction = () => {
    gulp.watch("src/scripts/*.js", publicJavascriptsMinFunction);
};
gulp.task("watch", watchFunction);
gulp.task("default", () => {
    publicJavascriptsMinFunction();
    watchFunction();
});
