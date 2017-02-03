happyLeaf.factory('deviceReady', function(){
  return function(done) {
    document.addEventListener('deviceready', function () {
      console.log("Device is ready");
      done();
    }, false);
  };
});

happyLeaf.factory('bluetoothScan', function(){
	return {
		getDevices: function(callback){
			bluetoothSerial.list(
        function(results) {
        	console.log("got "+results.length+" bluetooth accessories")
        	console.log(JSON.stringify(results));
          callback(null, results);
        },
        function(error) {
          callback(err, null);
        }
    	);
		}
	}
});

happyLeaf.factory('bluetoothSend', function(){
  var sendCode = function(code, callback){
    bluetoothSerial.write(code, function(data){
      console.log("sent: " + code + " got:");
      console.log(data);

      bluetoothSerial.read(function(readdata) {
        console.log("Bluetooth read:")
        console.log(readdata);
        callback(data);
      }, function(){
        console.log("Bluetooth read error!");
      });
    }, function(err){
      console.log("ran into an error");
      callback(err);
    });

  };

  return {
    //Takes a string array of commands to send to the bluetooth device
    send: function(array, callback){
      if(Array.isArray(array)) {
        var log = [];
        for(var i = 0; i < array.length; i ++) {
//          setTimeout(function(){
            //console.log(i);
            sendCode(array[i] + "\\r\\n", function(data){
              log.push(data);
              if(log.length == array.length) {
                callback(log);
              }
            });
  //        }, 100 * i)
        }
      } else {
        sendCode(array + "\\r\\n", callback);
      }
    }
  }
});
