DEPRECATED, now modules are not made with iframes, see: https://github.com/meemoo/iframework/tree/master/src/nodes

---

 _____                           _     
|     |___ ___ _____ ___ ___    |_|___ 
| | | | -_| -_|     | . | . |_  | |_ -|
|_|_|_|___|___|_|_|_|___|___|_|_| |___|
       http://meemoo.org/     |___|

Use it something like this:

<script type="text/javascript" src="http://meemoo.org/meemoo/v1/meemoo-min.js"></script>
<script type="text/javascript">

  Meemoo
    .setInfo({
      title: "example",
      author: "forresto",
      description: "example to show how to turn html into a Meemoo module"
    })
    .addInputs({
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
      }
    })
    .addOutputs({
      squared: { 
        type: "number"
      },
      reversed: { 
        type: "string"
      }
    });
    
</script>
