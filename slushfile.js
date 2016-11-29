/*
 * slush-sitecore-helix
 * https://github.com/bmyers/slush-sitecore-helix
 *
 * Copyright (c) 2016, Ben Myers
 * Licensed under the MIT license.
 */

'use strict';

const gulp = require('gulp');
const install = require('gulp-install');
const conflict = require('gulp-conflict');
const template = require('gulp-template');
const rename = require('gulp-rename');
const change = require('gulp-change');
const inquirer = require('inquirer');
const guid = require('node-uuid');
const runSequence = require('run-sequence').use(gulp);
const path = require('path');
const colors = require('colors');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}

function generateGuid() {
    var id = '{' + guid.v4() + '}';
    return id.toUpperCase();
}
var defaults = (function () {
    var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
        workingDirName = process.cwd(),
        osUserName = homeDir && homeDir.split('/').pop() || 'root',
        configFile = homeDir + '/.gitconfig',
        user = {};
    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }

    return {
        solutionName: 'Sitecore',
        userName: format(user.name) || osUserName,
        workingDirName: workingDirName,
        foundationName: 'Foundation',
        featureName: 'Feature'
    };
})();

gulp.task('default', function (done) {
    const createSolution = require('./tasks/createSolution/index');
    const createConfig = require('./tasks/createConfig/index');

    console.log('');
    console.log('Before generating your Sitecore solution, make sure to install a copy of Sitecore using SIM.'.red);
    console.log('');

    const prompts = [{
        name: 'solutionName',
        message: 'What is the name of your project?',
        default: 'Sitecore'
    }, {
        name: 'sitecoreFolder',
        message: 'Where is your Sitecore webroot?',
        default: 'C:\\websites\\Sitecore\\Website'
    }, {
        name: 'hostName',
        message: 'What is the host name?',
        default: 'http://sitecore.local'
    }, {
        name: 'multisite',
        type: 'confirm',
        message: 'Is this a multisite solution?',
        default: false
    }];

    inquirer.prompt(prompts,
        function (answers) {
            const createSolutionTask = createSolution(answers);
            const createConfigTask = createConfig(answers);

            answers.userName = defaults.userName;
            answers.workingDirName = defaults.workingDirName;
            answers.assemblyName = answers.solutionName + '.Website';
            answers.sitecoreFolder = answers.sitecoreFolder.replace(/\\/g, '\\\\');
            answers.projectGuid = generateGuid();
            answers.commonProjectGuid = generateGuid();
            answers.configFolder = generateGuid();
            answers.featureFolder = generateGuid();
            answers.projectFolder = generateGuid();
            answers.commonProjectFolder = generateGuid();
            answers.foundationFolder = generateGuid();
            answers.solutionFolder = generateGuid();            
            
            if (answers.multisite) {
                
                runSequence([createSolutionTask.taskName, createConfigTask.taskName], 'project', 'install', done);
            } else {
                runSequence([createSolutionTask.taskName, createConfigTask.taskName], 'install', done);
            }
        });
});

gulp.task('foundation', function (done) {
    const createFoundationProject = require('./tasks/project/createProject/index');
    const addFoundationProjectToSolution = require('./tasks/project/addProjectToSolution/index');
    const addFoundationNestedProjectToSolution = require('./tasks/project/addNestedProjectToSolution/index');
    const addFoundationBuildsToSolution = require('./tasks/project/addBuildsToSolution/index');
    const config = require(path.join(process.cwd(), './slushconfig.json'));

    const prompts = [{
        name: 'name',
        message: 'What is the name of your foundation project?',
        default: defaults.foundationName
    }, {
        type: 'confirm',
        name: 'createTestProject',
        message: 'Create a unit test project?',
        default: true
    }];

    inquirer.prompt(prompts,
        function (answers) {
            const createFoundationProjectTask = createFoundationProject(answers);
            const addFoundationProjectToSolutionTask = addFoundationProjectToSolution(answers);
            const addFoundationNestedProjectToSolutionTask = addFoundationNestedProjectToSolution(answers);
            const addFoundationBuildsToSolutionTask = addFoundationBuildsToSolution(answers);

            answers.projectGuid = generateGuid();
            answers.projectFolder = generateGuid();
            answers.parentFolder = config.foundationFolder;
            answers.projectType = 'Foundation';

            runSequence(
                createFoundationProjectTask.taskName,
                addFoundationProjectToSolutionTask.taskName,
                addFoundationNestedProjectToSolutionTask.taskName,
                addFoundationBuildsToSolutionTask.taskName);

            if (answers.createTestProject) {
                answers.testProjectGuid = generateGuid();

                const createUnitTestProject = require('./tasks/project/unitTestProject/index');
                const addUnitTestProjectToSolution = require('./tasks/project/addUnitTestProjectToSolution/index');
                const addUnitTestNestedProjectToSolution = require('./tasks/project/addNestedUnitTestProjectToSolution/index');
                const addUnitTestBuildsToSolution = require('./tasks/project/addBuildsToSolution/index');
                const createUnitTestProjectTask = createUnitTestProject(answers);
                const addUnitTestProjectToSolutionTask = addUnitTestProjectToSolution(answers);
                const addUnitTestNestedProjectToSolutionTask = addUnitTestNestedProjectToSolution(answers);
                const addUnitTestBuildsToSolutionTask = addUnitTestBuildsToSolution(answers);

                runSequence(
                    createUnitTestProjectTask.taskName,
                    addUnitTestProjectToSolutionTask.taskName,
                    addUnitTestNestedProjectToSolutionTask.taskName,
                    addUnitTestBuildsToSolutionTask.taskName);
            }

            done();
        });
});

gulp.task('feature', function (done) {
    const createFeatureProject = require('./tasks/project/createProject/index');
    const addFeatureProjectToSolution = require('./tasks/project/addProjectToSolution/index');
    const addFeatureNestedProjectToSolution = require('./tasks/project/addNestedProjectToSolution/index');
    const addFeatureBuildsToSolution = require('./tasks/project/addBuildsToSolution/index');
    const config = require(path.join(process.cwd(), './slushconfig.json'));

    const prompts = [{
        name: 'name',
        message: 'What is the name of your feature project?',
        default: defaults.featureName
    }, {
        type: 'confirm',
        name: 'createTestProject',
        message: 'Create a unit test project?',
        default: true
    }, {
        type: 'confirm',
        name: 'transparentSync',
        message: 'Use Unicorn transparent sync?',
        default: true
    }];

    inquirer.prompt(prompts,
        function (answers) {
            const createFeatureProjectTask = createFeatureProject(answers);
            const addFeatureProjectToSolutionTask = addFeatureProjectToSolution(answers);
            const addFeatureNestedProjectToSolutionTask = addFeatureNestedProjectToSolution(answers);
            const addFeatureBuildsToSolutionTask = addFeatureBuildsToSolution(answers);

            answers.projectGuid = generateGuid();
            answers.projectFolder = generateGuid();
            answers.parentFolder = config.featureFolder;
            answers.projectType = 'Feature';

            runSequence(
                createFeatureProjectTask.taskName,
                addFeatureProjectToSolutionTask.taskName,
                addFeatureNestedProjectToSolutionTask.taskName,
                addFeatureBuildsToSolutionTask.taskName);

            if (answers.createTestProject) {
                answers.testProjectGuid = generateGuid();

                const createUnitTestProject = require('./tasks/project/unitTestProject/index');
                const addUnitTestProjectToSolution = require('./tasks/project/addUnitTestProjectToSolution/index');
                const addUnitTestNestedProjectToSolution = require('./tasks/project/addNestedUnitTestProjectToSolution/index');
                const addUnitTestBuildsToSolution = require('./tasks/project/addBuildsToSolution/index');
                const createUnitTestProjectTask = createUnitTestProject(answers);
                const addUnitTestProjectToSolutionTask = addUnitTestProjectToSolution(answers);
                const addUnitTestNestedProjectToSolutionTask = addUnitTestNestedProjectToSolution(answers);
                const addUnitTestBuildsToSolutionTask = addUnitTestBuildsToSolution(answers);

                runSequence(
                    createUnitTestProjectTask.taskName,
                    addUnitTestProjectToSolutionTask.taskName,
                    addUnitTestNestedProjectToSolutionTask.taskName,
                    addUnitTestBuildsToSolutionTask.taskName);
            }

            if (answers.transparentSync) {
                answers.templateItemGuid = generateGuid();
                answers.renderingItemGuid = generateGuid();
                answers.transparentSyncSetting = '<dataProviderConfiguration type="Unicorn.Data.DataProvider.DefaultUnicornDataProviderConfiguration, Unicorn" enableTransparentSync="true" />';

                const addUnicornSerialization = require('./tasks/project/addUnicornSerialization/index');
                const addUnicornConfig = require('./tasks/project/addUnicornConfigToProject/index');
                const addUnicornSerializationTask = addUnicornSerialization(answers);
                const addUnicornConfigTask = addUnicornConfig(answers);

                runSequence(addUnicornSerializationTask.taskName,
                    addUnicornConfigTask.taskName);
            }

            done();
        });
});

gulp.task('project', function (done) {
    const createMultisiteProject = require('./tasks/project/createProjectTypeProject/index');
    const addMultisiteProjectToSolution = require('./tasks/project/addProjectTypeProjectToSolution/index');
    const addMultisiteNestedProjectToSolution = require('./tasks/project/addNestedProjectToSolution/index');
    const addMultisiteBuildsToSolution = require('./tasks/project/addBuildsToSolution/index');    

    const prompts = [{
        name: 'name',
        message: 'What is the name of your multisite project?',
        default: 'Common'
    }];

    inquirer.prompt(prompts,
        function (answers) {
            const createMultisiteProjectTask = createMultisiteProject(answers);
            const addMultisiteProjectToSolutionTask = addMultisiteProjectToSolution(answers);
            const addMultisiteNestedProjectToSolutionTask = addMultisiteNestedProjectToSolution(answers);
            const addMultisiteBuildsToSolutionTask = addMultisiteBuildsToSolution(answers);
            const config = require(path.join(process.cwd(), './slushconfig.json'));

            answers.projectGuid = generateGuid();
            answers.projectFolder = generateGuid();
            answers.parentFolder = config.projectFolder;
            answers.projectType = 'Project';            

            runSequence(
                createMultisiteProjectTask.taskName,
                addMultisiteProjectToSolutionTask.taskName,
                addMultisiteNestedProjectToSolutionTask.taskName,
                addMultisiteBuildsToSolutionTask.taskName,
                done);
        });
});

gulp.task('install', (done) => {
    return gulp
        .src(['./package.json'])
        .pipe(install());
});