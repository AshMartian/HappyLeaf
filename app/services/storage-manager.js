import Ember from 'ember';
import subscribe from 'ember-cordova-events/utils/subscribe';

export default Ember.Service.extend({
    dataManager: Ember.inject.service('data-manager'),
  
    databaseReady: false,

    isReady: subscribe('cordova.deviceready', function() {
        console.log("Device is ready!");
        this.connectDatabase();
    }),

    connectDatabase: function connectDatabase() {
        var _this = this;

        if (window.sqlitePlugin) {
            db = window.sqlitePlugin.openDatabase({ name: 'history.db', iosDatabaseLocation: 'Documents' }, function () {
                _this.set('databaseReady', true);
                console.log("SQL database is opened");
                if (window.location.hash !== "#/home") {
                    _this.createTable();
                } else {
                    _this.get('dataManager').getTodayHistory();
                }
            });
        }
    },
    createTable: function createTable() {
        //var dataKeys = Object.keys(this.get('dataManager.data')).join().replace('startTime,', 'startTime integer PRIMARY KEY,');
        var dataKeys = 'startTime integer PRIMARY KEY, data string';
        console.log("About to create table", dataKeys);
        db.transaction(function (transaction) {
            transaction.executeSql('CREATE TABLE Logs (' + dataKeys + ')');
        });
    },
    storeHistoryLog: function storeHistoryLog(currentData) {
        //var keys = Object.getOwnPropertyNames(currentData);
        //console.log("Checking available data", keys);
        /*
        for(var i = 0; i < keys.length; i++){
            if(typeof currentData[keys[i]] == 'object'){
                currentData[keys[i]] = `'${JSON.stringify(currentData[keys[i]])}'`;
            } else if(typeof currentData[keys[i]] == 'boolean') {
                currentData[keys[i]] = currentData[keys[i]] ? 0 : 1
            } else if(typeof currentData[keys[i]] !== 'number') {
                currentData[keys[i]] = `'${currentData[keys[i]]}'`
            }
        }*/

        //var insertString = _.values(currentData).join()
        var insertString = currentData.startTime + ', \'' + JSON.stringify(currentData) + '\'';
        //console.log("Saving data to logs ", currentData.startTime);

        if (this.get('databaseReady')) {
            db.transaction(function (transaction) {
                transaction.executeSql('INSERT OR REPLACE INTO Logs VALUES (' + insertString + ')', [], function (tx, resultSet) {
                    console.log('resultSet.insertId: ' + resultSet.insertId);
                    //console.log('resultSet.rowsAffected: ' + resultSet.rowsAffected);
                }, function (tx, error) {
                    console.log('INSERT error: ', error);
                });
            }, function (error) {
                console.log("INSERT ERROR: ", error);
            }, function () {
                console.log("INSERT OK");
            });
        } else {
            console.log("DATABASE Not ready!!");
        }
    },
    getLastHistory: function getLastHistory(callback) {
        console.log("Getting data from logs");
        if (this.get('databaseReady')) {
            db.readTransaction(function (transaction) {
                transaction.executeSql('SELECT * FROM Logs WHERE startTime = (SELECT max(startTime) FROM Logs)', [], function (tx, res) {
                    //console.log('SELECT GOT: ', res.rows.item(0));
                    if (typeof callback == 'function') callback(JSON.parse(res.rows.item(0).data));
                }, function (tx, error) {
                    console.log('SELECT error: ', error);
                });
            });
        } else {
            console.log("DATABASE Not ready!!");
        }
    },
    getTodayHistory: function getTodayHistory(callback) {
        var _this2 = this;

        if (this.get('databaseReady')) {
            db.readTransaction(function (transaction) {
                transaction.executeSql('SELECT * FROM Logs WHERE startTime > ?', [new Date().getTime() - 86400000], function (tx, res) {
                    //console.log('SELECT DAY GOT: ', res.rows);
                    var allData = {};
                    for (var i = 0; i < res.rows.length; i++) {
                        allData[res.rows.item(i).startTime] = JSON.parse(res.rows.item(i).data);
                    }
                    if (typeof callback == 'function') callback(allData);
                }, function (tx, error) {
                    console.log('SELECT error: ', error);
                });
            });
        } else {
            setTimeout(function () {
                _this2.getTodayHistory(callback);
            }, 1000);
            console.log("DATABASE Not ready (today history)!!");
        }
    },
    resetDatabase: function resetDatabase() {
        var _this3 = this;

        if (this.get('databaseReady')) {
            db.transaction(function (transaction) {
                transaction.executeSql('DROP TABLE Logs', [], function (tx, resultSet) {
                    //console.log('resultSet.insertId: ' + resultSet.insertId);
                    console.log('resultSet.rowsAffected: ' + resultSet.rowsAffected);
                    _this3.createTable();
                }, function (tx, error) {
                    console.log('INSERT error: ', error);
                });
            });
        }
    }
});
