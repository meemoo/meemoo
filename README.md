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
      },
      stop: {
        action: function (m) {
          // Start function
          Meemoo.send("stopped");
        },
      },
    }).addOutputs({
      started: { 
        type: "bang"
      },
      stopped: { 
        type: "bang"
      }
    });
  
