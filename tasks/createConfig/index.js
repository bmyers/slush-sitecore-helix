/*
 * slush-sitecore-helix
 * https://github.com/bmyers/slush-sitecore-helix
 *
 * Copyright (c) 2016, Ben Myers
 * Licensed under the MIT license.
 */

'use strict';

const gulp = require('gulp');
const jeditor = require('gulp-json-editor');

module.exports = (answers) => {
    const taskName = 'createConfig';

    gulp.task(taskName, (done) => {

        gulp.src(__dirname + '/slushconfig.json')
            .pipe(jeditor({
                'solutionName': answers.solutionName,
                'foundationFolder': answers.foundationFolder,
                'featureFolder': answers.featureFolder,
                'projectFolder': answers.projectFolder
            }))
            .pipe(gulp.dest('./'))
            .on('end', function () {
                done();
            });
    });

    return {
        taskName: taskName
    };
};