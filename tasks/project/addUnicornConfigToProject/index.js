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
const replace = require('gulp-replace');
const path = require("path");
const fs = require('fs');
const util = require('gulp-util')

module.exports = (answers) => {
    const cwd = process.cwd();
    const taskName = 'addUnicornConfigToProject';

    gulp.task(taskName, (done) => {
        const projectPath = path.join(cwd, './src', answers.projectType, answers.name, 'code');
        const csprojName = answers.solutionName + '.' + answers.projectType + '.' + answers.name + '.csproj';
        const templatePath = __dirname + '/templates/project.txt';
        const projectTemplate = fs.readFileSync(templatePath, 'utf-8');        
        
        const opts = {
            file: templatePath,
            projectType: answers.projectType,
            name: answers.name
        };

        const replaceText = util.template(projectTemplate, opts);
        const searchText = '<Content Include="App_Config\\Include\\' + answers.projectType + '\\' + answers.projectType + '\.' + answers.name + '\.config" \/>';
        const regex = new RegExp(searchText);
        
        gulp.src(csprojName, {cwd: projectPath})
            .pipe(replace(searchText, replaceText))
            .pipe(gulp.dest(projectPath))
            .on('end', function () {
                done();
            });
    });

    return {
        taskName: taskName
    };
};