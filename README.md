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
      setState: {
        action: function (data) {
          if ( data.bpm ) {
            Meemoo.inputs.bpm(data.bpm);
          }
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
  
