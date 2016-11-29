module.exports = function() {
    var config = {
        websiteRoot: "<%= sitecoreFolder %>",
        sitecoreLibraries: "<%= sitecoreFolder %>\\bin",
        solutionName: "<%= solutionName %>",
        buildConfiguration: "Debug",
        runCleanBuilds: false
    }
    return config;
}