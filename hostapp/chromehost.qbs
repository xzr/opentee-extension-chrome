import qbs

CppApplication {
    type: "application"
    name: "chromehost"
    //cpp.includePaths: ['../../open-tee/libtee/include']
    Depends { name: "tee" }
    consoleApplication: true
    destinationDirectory: '.'

    files: ['main.cpp']
}
