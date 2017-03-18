happyLeaf.factory('deviceReady', function(){
  return function(done) {
    document.addEventListener('deviceready', function () {
      console.log("Device is ready");
      done();
    }, false);
  };
});

happyLeaf.factory('bluetoothSerial', function(){
  return bluetoothSerial;
});

happyLeaf.factory('bluetoothSend', function(){
  var shouldSend = false;
  var forceSend = true;
  var sendCode = function(code, callback){
    shouldSend = false;
    bluetoothSerial.write(code, function(data){
      console.log("sent: " + code + " got: " + data);
      callback(data);
    }, function(err){
      console.log("ran into an error");
      callback(err);
    });
  };

  var self =  {
    waitingObserverCallbacks: [],

    //register an observer
    onWaiting:function(callback){
      self.waitingObserverCallbacks.push(callback);
    },

    notifyWaiting: function(param){
      async.forEach(self.waitingObserverCallbacks, function(action){
        if(typeof action == "function"){
          //action(param);
        }
      });
    },

    //Takes a string array of commands to send to the bluetooth device
    shouldSend: function(){
      shouldSend = true;
    },
    currentCommands: [],
    sentCommands: [],

    lastCommand: "",
    isWaiting: false,
    failedSend: [],
    resendLast: function(){
      shouldSend = false;
      sendCode(self.lastCommand + "\r", function(data){
        shouldSend = true;
        forceSend = true;
        self.sentCommands.push(self.lastCommand);
      });
    },
    send: function(array, callback){
      self.failedSend = [];
      if(Array.isArray(array)) {
        self.currentCommands = array;
        var log = [];
        async.eachSeries(array, function(command, next) {
          var forceSend = setTimeout(function(){
              shouldSend = true;
              self.failedSend.push(self.lastCommand);
              console.log("Forcing send");
          }, 300);

          var wait = function(){
            if(shouldSend){
              clearTimeout(forceSend);
              self.isWaiting = false;
              var commandstoSend = command;
              if(commandstoSend != "X") {
                commandstoSend = commandstoSend + "\r";
              }
              self.notifyWaiting(false);
              sendCode(commandstoSend, function(data){
                self.lastCommand = command;
                log.push(data);
                next();
              });
            } else {
              self.notifyWaiting(true);
              self.isWaiting = true;
              setTimeout(wait, 8);
            }
          }

          wait();

        }, function(err){
          /*var readyCount = 0;
          No idea why I would need this, but I wrote this in attempt to fix a bug
          var checkReady = function(){
            if(shouldSend || readyCount > 30 || $self.sentCommands.length == $self.commandstoSend.length) {
              callback(log);
            } else {
              readyCount ++;
              setTimeout(checkReady, 15);
            }
          }
          checkReady();*/
          callback(log);
        });
      } else {
        sendCode(array + "\r", callback);
      }
    }
  }
  return self;
});
