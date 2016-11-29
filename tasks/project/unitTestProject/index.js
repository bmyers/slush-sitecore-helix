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
const path = require("path");

module.exports = (answers) => {
    const config = require(path.join(process.cwd(), './slushconfig.json'));
    const taskName = 'createUnitTestProject';

    gulp.task(taskName, (done) => {

        answers.solutionName = config.solutionName;
        answers.parentFolder = answers.parentFolder;
        answers.assemblyName = answers.solutionName + '.' + answers.projectType + '.' + answers.name;

        gulp.src([__dirname + '/templates/**'])
            .pipe(template(answers))
            .pipe(rename(function (file) {
                // replace folder names
                if (file.dirname.indexOf('projectType') !== -1) {
                    file.dirname = file.dirname.replace('projectType', answers.projectType);
                }
                if (file.dirname.indexOf('Include\\projectType') !== -1) {
                    file.dirname = file.dirname.replace('projectType', answers.projectType);
                }
                if (file.dirname.indexOf('name') !== -1) {
                    file.dirname = file.dirname.replace('name', answers.name);
                }

                // replace file names
                if (file.basename === 'projectType' && file.extname === '') {
                    file.basename = answers.projectType;
                }
                if (file.basename === 'name' && file.extname === '') {
                    file.basename = answers.name;
                }
                if (file.basename.indexOf('projectType') !== -1 && file.extname !== '') {
                    file.basename = file.basename.replace('projectType', answers.projectType);
                }
                if (file.basename.indexOf('name') !== -1 && file.extname !== '') {
                    file.basename = file.basename.replace('name', answers.name);
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