# LocDB

LocDB is a local in-memory database module for NodeJS. It stores data in json files.
LocDB is more reliable than you would think, since it does not constantly read from the json files, it only does that once you initialize the module, after that it is stored in memory and only written to the json files when updated.

## Installation

Use the package manager [npm](https://npmjs.com) to install LocDB.

```bash
npm i locdb
```

## Usage
initialize the module
```javascript
var Locdb = require('locdb');
var database = new LocDB('/path/to/directory');
```

retrieve, define or update and remove data.
```javascript
//Your data is stored as an Object or Array (based on what you stored in your json file.), so you can treat it just like any javascript Array or Object.
//All databases are stored within .db

console.log(database.db.databaseName.someKey); //undefined

database.db.databaseName.someKey = 'value';
console.log(database.db.databaseName.someKey); //'value'

database.db.databaseName.someKey = 'otherValue';
console.log(database.db.databaseName.someKey); //'otherValue'

remove database.db.databaseName.someKey;
console.log(database.db.databaseName.someKey); //undefined
```

**setUpdateInterval(Number: interval):** Change the interval (milliseconds) in which the json files are update for changes. Default is 500ms. (half a second)
```javascript
database.setUpdateInterval(500);
```

**exists(String: db, [OPTIONAL] Boolean: file):** Check if a database is registered or if the JSON file for the database exists.
```javascript
//db is registered and file exists.
database.exists('databaseName') //true
database.exists('databaseName', true) //true

//db is registered but file is missing.
database.exists('databaseName') //true
database.exists('databaseName', true) //false

//db is note registered but file exists.
database.exists('databaseName') //false
database.exists('databaseName', true) //true

//db is not registered and file is missing.
database.exists('databaseName') //false
database.exists('databaseName', true) //false
```

**register(String: db):** Register a new database. If a JSON file for the database already exists, it won't be overwritten.
```javascript
database.register('otherDatabase'); //won't return anything.
```

**purge(String: db):** Removes a database, you will have to make a backup yourself.
```javascript
database.purge('otherDatabase'); //won't return anything.
```

**log(String: msg):** system function, puts out a message in the console and log file.
```javascript
database.log('Log message');
```

config.json: stores configuration and a list of databases.
```json
{
    "updateInterval": 500,
    "list": [
        "example"
    ]
}
```

Directory structure:
```
database_directory/
├───files
│   └───example.json
├───logs
│   └───date.locdb.log
└───config.json
```

## Contributing
If you want to make an addition to the project, please make a pull request or for major changes, open an issue.

## License
[MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/)
