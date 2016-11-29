/*
 * slush-sitecore-helix
 * https://github.com/bmyers/slush-sitecore-helix
 *
 * Copyright (c) 2016, Ben Myers
 * Licensed under the MIT license.
 */

'use strict';

const gulp = require('gulp');
const conflict = require('gulp-conflict');
const template = require('gulp-template');
const rename = require('gulp-rename');

module.exports = (answers) => {
    const taskName = 'createSolution';

    gulp.task(taskName, (done) => {
        gulp.src(__dirname + '/templates/**')
            .pipe(template(answers))
            .pipe(rename(function (file) {
                if (file.basename === 'solutionName' && file.extname === '') {
                    file.basename = answers.solutionName;
                }
                if (file.dirname.indexOf('src\\Project\\solutionName') !== -1) {
                    file.dirname = file.dirname.replace('solutionName', answers.solutionName);
                }
                if (file.basename.indexOf('solutionName') !== -1 && file.extname !== '') {
                    file.basename = file.basename.replace('solutionName', answers.solutionName);
                }
            }))
            .pipe(conflict('./'))
            .pipe(gulp.dest('./'))
            .on('end', function () {
                done();
            });
    });

    return {
        taskName: taskName
    };
};