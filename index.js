const fs = require('fmng');
const gawk = require('gawk').gawk;

if (!fs.exists(__dirname + '/config.json')) fs.mkfile(__dirname + '/config.json', fs.read(__dirname + '/config.default.json'));
let config = require(__dirname + '/config.json');
const updateConfig = () => { fs.write(__dirname + '/config.json', JSON.stringify(config, null, 4)); }

class Locdb {
    constructor() {
        this.db = {};
        this.updated = [];
        config.list.forEach((db) => {
            if (fs.exists(__dirname + '/files/' + db + '.json')) {
                this.db[db] = gawk(require(__dirname + '/files/' + db + '.json'));
                gawk.watch(this.db[db], (newval, oldval) => {
                    this.updated.push(db);
                });
            } else {
                console.log('E: locdb.constructor() (initialization) ~> Database "' + db + '" was listed in configuration but its file seems to be missing!');
                console.log('N: locdb.constructor() (initialization) ~> Automatically creating a new file, but data is gone!');
                this.log('E: locdb.constructor() (initialization) ~> Database "' + db + '" was listed in configuration but its file seems to be missing!');
                this.log('N: locdb.constructor() (initialization) ~> Automatically creating a new file, but data is gone!');
                fs.create(__dirname + '/files/' + db + '.json');
                fs.write(__dirname + '/files/' + db + '.json', '{}');
            }
        });

        this.updater = setInterval(() => {
            for (var i = 0; i < this.updated.length; i++) {
                let db = this.updated[i];
                fs.write(__dirname + '/files/' + db + '.json', JSON.stringify(this.db[db], null, 4));
            }
            this.updated = [];
        }, config.updateInterval);
    }

    setUpdateInterval(interval) {
        config.updateInterval = interval;
        updateConfig();

        clearInterval(this.updater);
        this.updater = setInterval(() => {
            for (var i = 0; i < this.updated.length; i++) {
                let db = this.updated[i];
                fs.write(__dirname + '/files/' + db + '.json', JSON.stringify(this.db[db], null, 4));
            }
            this.updated = [];
        }, config.updateInterval);
    }

    exists(db, file = false) {
        if (file) {
            return fs.exists(__dirname + '/files/' + db + '.json');
        } else {
            return config.list.includes(db);
        }
    }

    new(db) {
        if (!this.exists(db, true)) {
            fs.create(__dirname + '/files/' + db + '.json');
        }

        if (fs.read(__dirname + '/files/' + db + '.json') === '') {
            fs.write(__dirname + '/files/' + db + '.json', '{}');
        }

        if (!this.exists(db)) {
            config.list.push(db);
            updateConfig();
        }

        this.db[db] = gawk(require(__dirname + '/files/' + db + '.json'));
        gawk.watch(this.db[db], (newval, oldval) => {
            this.updated.push(db);
        });
    }

    purge(path) {
        if (this.exists(path)) {
            fs.remove(__dirname + '/files/' + path + '.json');
            this.db[path] = undefined;
            config.list.splice(config.list.indexOf(path), 1)
            updateConfig();
        } else {
            console.log('E: locdb.purge() ~> DB "' + path + '" does not exist, aborted deletion!');
        }
    }

    log(msg) {
        if (msg !== undefined) {
            var date = new Date();
            var today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            try {
                if (!fs.exists(__dirname + '/logs/' + today + '.locdb.log')) { fs.mk(__dirname + '/logs/' + today + '.locdb.log'); }
                fs.append(__dirname + '/logs/' + today + '.locdb.log', '[' + time + '] ~ ' + msg + "\n");
            } catch(e) {
                console.log('LOCDB ERROR: COULD NOT WRITE TO LOG! LOGGING ERROR(S).', e);
                return false;
            }
        } else {
            console.log('LOCDB ERROR: LOG MESSAGE MUST BE GIVEN IN!');
            return false;
        }

        return true;
    }
}

module.exports = new Locdb();
