     _____                           _     
    |     |___ ___ _____ ___ ___    |_|___ 
    | | | | -_| -_|     | . | . |_  | |_ -|
    |_|_|_|___|___|_|_|_|___|___|_|_| |___|
                                  |___|

---

Include this in your ```<head></head>```:

    <script src="http://meemoo.github.com/meemoo/meemoo.js"></script>

Then:

    Meemoo.addInputs({
      start: {
        action: function (m) {
          // Start function
          Meemoo.send("started");
        },
        port: true
      },
      stop: {
        action: function (m) {
          // Start function
          Meemoo.send("stopped");
        },
        port: true
      },
      getState: {
        action: function (message, e) {
          // Return the current state as an escaped JSON object
          var state = {};
          return state;
        }
      },
      setState: {
        action: function (data) {
          // Data will be an object that should contain everything needed to restore state
        }
      }
    }).addOutputs({
      started: { 
        port: true
      },
      stopped: { 
        port: true
      }
    });
  
