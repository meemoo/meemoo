 _____                           _     
|     |___ ___ _____ ___ ___    |_|___ 
| | | | -_| -_|     | . | . |_  | |_ -|
|_|_|_|___|___|_|_|_|___|___|_|_| |___|
                              |___|

Include this in your <head></head>:

    <script src="http://meemoo.org/meemoo/v1/meemoo-min.js"></script>

Then:

    Meemoo.addInputs({
      square: {
        action: function (n) {
          Meemoo.send("squared", n*n);
        },
        type: "number"
      },
      reverse: {
        action: function (s) {
          var reversed = s.split("").reverse().join("");
          Meemoo.send("reversed", reversed);
        },
        type: "string"
      },
    }).addOutputs({
      squared: { 
        type: "number"
      },
      reversed: { 
        type: "string"
      }
    });
