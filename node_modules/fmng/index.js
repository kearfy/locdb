// Copyright FMNG 2019, a product by Micha de Vries.
// I am not responsible for any (if possible) damages made.
// for bugs, please report them at the github repo which can be found at https://github.com/kearfy/fmng
// for suggestions, contant me through discord ( @kearfy#2139 ) or open an issue where you formally describe your feature request.
// A site for issue / bugs and suggestions will soon be made.

const fs = require('fs');

//logging

function log(msg) {
    if (msg !== undefined) {
        var date = new Date();
        var today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
        var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        try {
            fs.appendFileSync(__dirname + '/logs/' + today + '.fmng.log', '[' + time + '] ~ ' + msg + "\n");
        } catch(e) {
            console.log('JDB ERROR: COULD NOT WRITE TO LOG! LOGGING ERROR(S).', e);
            return false;
        }
    } else {
        console.log('JDB ERROR: LOG MESSAGE MUST BE GIVEN IN!');
        return false;
    }

    return true;
}

class Fmng {

    //check if file / dir exists

        exists(file) {
            try {
                var result = fs.existsSync(file);
            } catch(e) {
                console.log('E: fmng.exists() ~> could not check if path exists! logging error', e);
                log('E: fmng.exists() ~> could not check if path exists! logging error');
                log(e);
                return false;
            }

            return result;
        }

    //check if path is a file

        isfile(path, caller) {
            var caller = (caller !== undefined ? caller : 'mkfile');

            try {
                var result = fs.statSync(path).isFile();
            } catch(e) {
                console.log('E: fmng.' + caller + '() ~> could not check if path is file! logging error', e);
                log('E: fmng.' + caller + '() ~> could not check if path is file! logging error');
                log(e);
                return false;
            }

            return result;
        }

        isFile(path) { return this.isfile(path, 'isFile'); }

    //check if path is a directory

        isdir(path, caller) {
            var caller = (caller !== undefined ? caller : 'mkfile');

            try {
                var result = fs.statSync(path).isDirectory();
            } catch(e) {
                console.log('E: fmng.' + caller + '() ~> could not check if path is directory! logging error', e);
                log('E: fmng.' + caller + '() ~> could not check if path is directory! logging error');
                log(e);
                return false;
            }

            return result;
        }

        isDir(path) { return this.isdir(path, 'isDir'); }
        isdirectory(path) { return this.isdir(path, 'isdirectory'); }
        isDirectory(path) { return this.isdir(path, 'isDirectory'); }

    //write to file

        write(path, content = '') {
            if (this.isFile(path)) {
                if (!this.exists(path)) { console.log('N: fmng.write() ~> file does not exist yet, creating it...'); }

                try {
                    fs.writeFileSync(path, content);
                } catch(e) {
                    console.log('E: fmng.write() ~> could not write to file! logging error', e);
                    log('E: fmng.write() ~> could not write to file! logging error');
                    log(e);
                    return false;
                }
            } else {
                console.log('N: fnmg.sync.write() ~> path must be a file');
                return false;
            }

            return true;
        }

        append(path, content) {
            if (this.isFile(path)) {
                if (!this.exists(path)) { console.log('N: fmng.append() ~> file does not exist yet, creating it...'); }

                try {
                    fs.appendFileSync(path, content);
                } catch(e) {
                    console.log('E: fmng.append() ~> could not append to file! logging error', e);
                    log('E: fmng.append() ~> could not append to file! logging error');
                    log(e);
                    return false;
                }
            } else {
                console.log('N: fnmg.sync.append() ~> path must be a file');
                return false;
            }

            return true;
        }

    //make a file

        mkfile(path, content = '', caller) {
            var caller = (caller !== undefined ? caller : 'mkfile');

            if (!this.exists(path)) {
                try {
                    fs.writeFileSync(path, content);
                } catch(e) {
                    console.log('E: fmng.' + caller + '() ~> could not write to file! logging error', e);
                    log('E: fmng.' + caller + '() ~> could not write to file! logging error');
                    log(e);
                    return false;
                }
            } else {
                console.log('N: fnmg.sync.' + caller + '() ~> path must be a file');
                return false;
            }

            return true;
        }

        mk(path, content = '') { return this.mkfile(path, content, "mk"); }
        make(path, content = '') { return this.mkfile(path, content, "make"); }
        touch(path, content = '') { return this.mkfile(path, content, "touch"); }
        create(path, content = '') { return this.mkfile(path, content, "create"); }
        makefile(path, content = '') { return this.mkfile(path, content, "makefile"); }
        createfile(path, content = '') { return this.mkfile(path, content, "createfile"); }

    //make a directory

        mkdir(path, caller) {
            var caller = (caller !== undefined ? caller : 'mkdir');

            if (!this.exists(path)) {
                try {
                    fs.mkdirSync(path);
                } catch(e) {
                    console.log('E: fmng.' + caller + '() ~> could not create directory! logging error', e);
                    log('E: fmng.' + caller + '() ~> could not create directory! logging error');
                    log(e);
                    return false;
                }
            } else {
                console.log('E: fmng.' + caller + '() ~> path already exists!');
                return false;
            }

            return true;
        }

        makedir(path) { return this.mkdir(path, "makedir"); }
        createdir(path) { return this.mkdir(path, "createdir"); }
        mkdirectory(path) { return this.mkdir(path, "mkdirectory"); }
        makedirectory(path) { return this.mkdir(path, "makedirectory"); }
        createdirectory(path) { return this.mkdir(path, "createdirectory"); }

    //open / read a file

        read(path, encoding = 'utf8', caller) {
            var caller = (caller !== undefined ? caller : 'read');

            if (this.exists(path)) {
                if (this.isfile(path)) {
                    try {
                        var content = fs.readFileSync(path, encoding);
                    } catch(e) {
                        console.log('E: fmng.' + caller + '() ~> could not read file! logging error', e);
                        log('E: fmng.' + caller + '() ~> could not read file! logging error');
                        log(e);
                        return false;
                    }
                } else {
                    console.log('E: fmng.' + caller + '() ~> path must be pointed to a file!');
                    return false;
                }
            } else {
                console.log('E: fmng.' + caller + '() ~> file does not exist!');
                return false;
            }

            return content;
        }

        open(path, encoding = 'utf8') { return this.read(path, encoding, 'open'); }

    //remove / delete / unlink file

        unlink(path, input = false, caller) {
            var caller = (caller !== undefined ? caller : 'unlink');

            if (this.exists(path)) {
                if (this.isfile(path) && input) {
                    var content = this.read(path);
                } else {
                    var content = null;
                }

                try {
                    if (this.isfile(path)) {
                        fs.unlinkSync(path);
                    } else {
                        if (fs.readdirSync(path).length !== 0 && input) {
                            fs.readdirSync(path).forEach((file, index) => {
                                this.unlink(path + '/' + file, true, caller);
                            });
                        }

                        fs.rmdirSync(path);
                    }
                } catch(e) {
                    console.log('E: fmng.' + caller + '() ~> could not remove ' + (this.isfile(path) ? 'file' : 'directory') + '! logging error', e);
                    log('E: fmng.' + caller + '() ~> could not remove ' + (this.isfile(path) ? 'file' : 'directory') + '! logging error');
                    log(e);
                    return false;
                }
            } else {
                console.log('E: fmng.' + caller + '() ~> path does not exists!');
                return false;
            }

            return (content === null ? true : content);
        }

        remove(path, input = false) { return this.unlink(path, input, 'remove'); }
        rem(path, input = false) { return this.unlink(path, input, 'remove'); }
        delete(path, input = false) { return this.unlink(path, input, 'remove'); }
        del(path, input = false) { return this.unlink(path, input, 'remove'); }
}

module.exports = new Fmng();
