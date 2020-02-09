const fs = require('fmng');
const gawk = require('gawk').gawk;

class Locdb {
    constructor(dir) {
        if (!fs.exists(dir)) fs.mkdir(dir);
        if (!fs.exists(dir + '/config.json')) fs.mkfile(dir + '/config.json', fs.read(__dirname + '/config.default.json'));
        if (!fs.exists(dir + '/files')) fs.mkdir(dir + '/files');
        if (!fs.exists(dir + '/logs')) fs.mkdir(dir + '/logs');

        this.dir = dir;
        this.config = require(this.dir + '/config.json');
        this.updateConfig = () => { fs.write(dir + '/config.json', JSON.stringify(this.config, null, 4)); }
        this.db = {};
        this.updated = [];

        this.config.list.forEach((db) => {
            if (fs.exists(this.dir + '/files/' + db + '.json')) {
                this.db[db] = gawk(require(this.dir + '/files/' + db + '.json'));
                gawk.watch(this.db[db], (newval, oldval) => {
                    this.updated.push(db);
                });
            } else {
                console.log('E: locdb.constructor() (initialization) ~> Database "' + db + '" was listed in configuration but its file seems to be missing!');
                console.log('N: locdb.constructor() (initialization) ~> Automatically creating a new file, but data is gone!');
                this.log('E: locdb.constructor() (initialization) ~> Database "' + db + '" was listed in configuration but its file seems to be missing!');
                this.log('N: locdb.constructor() (initialization) ~> Automatically creating a new file, but data is gone!');
                fs.mkfile(this.dir + '/files/' + db + '.json', '{}');
            }
        });

        this.updater = setInterval(() => {
            for (var i = 0; i < this.updated.length; i++) {
                let db = this.updated[i];
                fs.write(this.dir + '/files/' + db + '.json', JSON.stringify(this.db[db], null, 4));
            }

            this.updated = [];
        }, this.config.updateInterval);
    }

    setUpdateInterval(interval) {
        this.config.updateInterval = interval;
        this.updateConfig();

        clearInterval(this.updater);
        this.updater = setInterval(() => {
            for (var i = 0; i < this.updated.length; i++) {
                let db = this.updated[i];
                fs.write(this.dir + '/files/' + db + '.json', JSON.stringify(this.db[db], null, 4));
            }
            this.updated = [];
        }, this.config.updateInterval);
    }

    exists(db, file = false) {
        if (file) {
            return fs.exists(this.dir + '/files/' + db + '.json');
        } else {
            return this.config.list.includes(db);
        }
    }

    register(db) {
        if (!this.exists(db, true)) {
            fs.create(this.dir + '/files/' + db + '.json');
        }

        if (fs.read(this.dir + '/files/' + db + '.json') === '') {
            fs.write(this.dir + '/files/' + db + '.json', '{}');
        }

        if (!this.exists(db)) {
            this.config.list.push(db);
            this.updateConfig();
        }

        this.db[db] = gawk(require(this.dir + '/files/' + db + '.json'));
        gawk.watch(this.db[db], (newval, oldval) => {
            this.updated.push(db);
        });
    }

    purge(db) {
        if (this.exists(db)) {
            fs.remove(this.dir + '/files/' + db + '.json');
            delete this.db[db];
            this.config.list.splice(this.config.list.indexOf(db), 1)
            this.updateConfig();
        } else {
            console.log('E: locdb.purge() ~> DB "' + db + '" does not exist, aborted deletion!');
        }
    }

    log(msg) {
        if (msg !== undefined) {
            var date = new Date();
            var today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            try {
                if (!fs.exists(this.dir + '/logs/' + today + '.locdb.log')) { fs.mkfile(this.dir + '/logs/' + today + '.locdb.log'); }
                fs.append(this.dir + '/logs/' + today + '.locdb.log', '[' + time + '] ~ ' + msg + "\n");
            } catch(e) {
                console.error('LOCDB ERROR: COULD NOT WRITE TO LOG! LOGGING ERROR(S).', e);
                return false;
            }
        } else {
            console.error('LOCDB ERROR: LOG MESSAGE MUST BE GIVEN IN!');
            return false;
        }

        return true;
    }
}

module.exports = Locdb;
