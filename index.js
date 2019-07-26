let config = require('./config.json');
const fs = require('fmng');
const updateConfig = () => { fs.write('./config.json', JSON.stringify(config)); }
const gawk = require('gawk').gawk;

class Jdb {
    constructor() {
        this.db = {};
        this.updated = [];
        config.list.forEach((db) => {
            if (fs.exists(__dirname + '/jdbs/' + db + '.json')) {
                this.db[db] = gawk(require(__dirname + '/jdbs/' + db + '.json'));
                gawk.watch(this.db[db], (newval, oldval) => {
                    this.updated.push(db);
                });
            } else {
                console.log('E: jdb.constructor() (initialization) ~> Database "' + db + '" was listed in configuration but its file seems to be missing!');
                console.log('N: jdb.constructor() (initialization) ~> Automatically creating a new file, but data is gone!');
                this.log('E: jdb.constructor() (initialization) ~> Database "' + db + '" was listed in configuration but its file seems to be missing!');
                this.log('N: jdb.constructor() (initialization) ~> Automatically creating a new file, but data is gone!');
                fs.create(__dirname + '/jdbs/' + db + '.json');
                fs.write(__dirname + '/jdbs/' + db + '.json', '{}');
            }
        });

        this.updater = setInterval(() => {
            for (var i = 0; i < this.updated.length; i++) {
                let db = this.updated[i];
                fs.write(__dirname + '/jdbs/' + db + '.json', JSON.stringify(this.db[db]));
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
                fs.write(__dirname + '/jdbs/' + db + '.json', JSON.stringify(this.db[db]));
            }
            this.updated = [];
        }, config.updateInterval);
    }

    exists(db, file = false) {
        if (file) {
            return fs.exists(__dirname + '/jdbs/' + db + '.json');
        } else {
            return config.list.includes(db);
        }
    }

    new(db) {
        if (!this.exists(db, true)) {
            fs.create(__dirname + '/jdbs/' + db + '.json');
        }

        if (fs.read(__dirname + '/jdbs/' + db + '.json') === '') {
            fs.write(__dirname + '/jdbs/' + db + '.json', '{}');
        }

        if (!this.exists(db)) {
            config.list.push(db);
            updateConfig();
        }

        this.db[db] = gawk(require(__dirname + '/jdbs/' + db + '.json'));
        gawk.watch(this.db[db], (newval, oldval) => {
            this.updated.push(db);
        });
    }

    purge(path, confirm = false) {
        if (this.exists(path)) {
            if (confirm) {
                fs.remove(__dirname + '/jdbs/' + path + '.json');
            } else {
                console.log('N: jdb.purge() ~> Did not delete database, no confirmation given in. Use jdb.purge(path, true) instead.');
            }
        } else {
            console.log('E: jdb.purge() ~> DB "' + path + '" does not exist, aborted deletion!');
        }
    }

    log(msg) {
        if (msg !== undefined) {
            var date = new Date();
            var today = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            try {
                if (!fs.exists(__dirname + '/logs/' + today + '.jdb.log')) { fs.mk(__dirname + '/logs/' + today + '.jdb.log'); }
                fs.append(__dirname + '/logs/' + today + '.jdb.log', '[' + time + '] ~ ' + msg + "\n");
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
}

module.exports = new Jdb();
