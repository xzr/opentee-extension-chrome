import qbs

CppApplication {
    type: "application"
    name: "chromehost"
    cpp.includePaths: ['./include/']
    Depends { name: "tee" }
    consoleApplication: true
    destinationDirectory: '.'

    files: ['main.cpp']
}
