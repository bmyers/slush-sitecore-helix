/*
 * slush-sitecore-helix
 * https://github.com/bmyers/slush-sitecore-helix
 *
 * Copyright (c) 2016, Ben Myers
 * Licensed under the MIT license.
 */

'use strict';

const gulp = require('gulp');
const template = require('gulp-template');
const change = require('gulp-change');
const conflict = require('gulp-conflict');
const replace = require('gulp-replace');
const path = require("path");
const fs = require('fs');
const util = require('gulp-util')

module.exports = (answers) => {
    const cwd = process.cwd();
    const config = require(path.join(cwd, './slushconfig.json'));
    const taskName = 'addProjectToSolution';

    gulp.task(taskName, (done) => {
        const solutionPath = path.join(cwd, './'  + config.solutionName + '.sln');
        const templatePath = __dirname + '/templates/project.txt';
        const projectTemplate = fs.readFileSync(templatePath, 'utf-8');        
        
        const opts = {
            file: templatePath,
            name: answers.name,
            projectFolder: answers.projectFolder,
            projectGuid: answers.projectGuid,
            solutionName: answers.solutionName,
            projectType: answers.projectType
        };

        const replaceText = util.template(projectTemplate, opts);

        gulp.src(solutionPath)            
            .pipe(replace(/EndProject\r?\nGlobal/g, replaceText))
            .pipe(gulp.dest('./'))
            .on('end', function () {
                done();
            });
    });

    return {
        taskName: taskName
    };
};