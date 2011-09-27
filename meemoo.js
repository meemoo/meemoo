(function (window) {
  "use strict";
  
  if (window.Meemoo) {
    // Meemoo already loaded, don't bother
    return false;
  }
  
  var meemoo = {
    parentWindow: window.opener ? window.opener : window.parent ? window.parent : void 0,
    connectedTo: [],
    // These types define the input widget style
    types: {
      bang: "bang",
      boolean: "boolean",
      int: "int",
      number: "number",
      string: "string",
      image: "image", // ImageData
      object: "object" // action:data
    },
    ready: function () {
      var info = {};
      if (document.title) {
        info.title = document.title;
      }
      if (document.getElementsByName("author").length > 0 && document.getElementsByName("author")[0].content) {
        info.author = document.getElementsByName("author")[0].content;
      }
      if (document.getElementsByName("description").length > 0 && document.getElementsByName("description")[0].content) {
        info.description = document.getElementsByName("description")[0].content;
      }
      this.sendParent("info", info);
    },
    sendParent: function (action, message){
      if (this.parentWindow) {
        var o = {};
        o[action] = message;
        this.parentWindow.postMessage(o, "*");
      }
    },
    send: function (action, message) {
      if ( this.connectedTo.length < 1 ) { return; }
      if (message === undefined) { message = action; }
      for (var i=0; i<this.connectedTo.length; i++) {
        if (this.connectedTo[i].source[1] === action) {
          var m;
          if (message.constructor === String) {
            m = "/"+this.connectedTo[i].target[1]+"/"+message;
          } else {
            m = {};
            m[this.connectedTo[i].target[1]] = message;
          }
          this.parentWindow.frames[this.connectedTo[i].target[0]].postMessage(m, "*");
        }
      }
    },
    recieve: function (e) {
      if (e.data.constructor === String) {
        var message = e.data.split("/");
        if ( message[1] && meemoo.inputs.hasOwnProperty(message[1]) ) {
          meemoo.inputs[message[1]](message[2], e);
        } else {
          // No action specified or, not an OSC-like String
          meemoo.inputs.all(e.data, e);
        }
      } else if (e.data.constructor === Object) {
        for (var name in e.data) {
          if (meemoo.inputs.hasOwnProperty(name)) {
            meemoo.inputs[name](e.data[name], e);
          } else {
            meemoo.inputs.all(e.data, e);
          }
        }
      }
    },
    // Inputs are functions available for other modules to trigger
    addInput: function(name, input) {
      meemoo.inputs[name] = input.action;
      
      if (input.port === true || input.port === "true") {
        // Expose port
        this.sendParent("addInput", {name:name, type:input.type});
      }
    },
    addInputs: function(inputs) {
      for (var name in inputs) {
        if (inputs.hasOwnProperty(name)) {
          meemoo.addInput(name, inputs[name]);
        }
      }
    },
    inputs: {
      connect: function (edge) {
        var toIndex = parseInt(edge.target[0], 10);
        // Make sure it is number
        if (toIndex === toIndex) {
          meemoo.connectedTo.push(edge);
        }
      },
      disconnect: function (message, e) {
        // var toIndex = parseInt(message[2], 10);
        // var results = [];
        // for(var i=0; i<meemoo.connectedTo.length; i++) {
        //   if (meemoo.connectedTo[i] != toIndex) {
        //     results.push(meemoo.connectedTo[i]);
        //   }
        // }
        // meemoo.connectedTo = results;
      },
      getState: function (message, e) {
        // Return the current state as an escaped JSON object
        return;
      },
      setState: function (message, e) {
        // Setup module with saved data
        return;
      },
      all: function (message, e) { 
        // console.log(message);
        return;
      }
    },
    // Outputs
    addOutput: function(name, output) {
      meemoo.outputs[name] = output;
      
      if (output.port === true || output.port === "true") {
        // Expose port
        this.sendParent("addOutput", {name:name, type:output.type});
      }
    },
    addOutputs: function(outputs) {
      for (var name in outputs) {
        if (outputs.hasOwnProperty(name)) {
          meemoo.addOutput(name, outputs[name]);
        }
      }
    },
    outputs: {
      
    }
  };
  
  window.addEventListener("message", meemoo.recieve, false);
  
  // Run this every 20ms to see if document is ready, then send info to parent
  var checkLoaded = setInterval(function(){ 
    if(document.body && document.getElementById){
      clearInterval(checkLoaded);
      meemoo.ready();
    }
  }, 20);
  
  // Expose Meemoo to the global object
  window.Meemoo = meemoo;
  
})(window);
