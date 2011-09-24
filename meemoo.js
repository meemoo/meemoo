(function (window) {
  
  var document = window.document;
  
  if (window.Meemoo) {
    // Meemoo already loaded, don't bother
    return false;
  }
  
  var meemoo = {
    parentWindow: window.opener ? window.opener : window.parent ? window.parent : void 0,
    connectedTo: [],
    types: {
      bang: "bang",
      boolean: "boolean",
      int: "int",
      number: "number",
      string: "string",
      osc: "osc", // slash-delimited string
      json: "json", // encoded JSON object
      image: "image", // ImageData
      object: "object" // anything
    },
    ready: function () {
      var info = {};
      if (document.title) 
        info.title = document.title;
      if (document.getElementsByName("author").length > 0 && document.getElementsByName("author")[0].content)
        info.author = document.getElementsByName("author")[0].content;
      if (document.getElementsByName("description").length > 0 && document.getElementsByName("description")[0].content)
        info.description = document.getElementsByName("description")[0].content;
      this.sendParent( "/info/"+encodeURIComponent(JSON.stringify(info)) );
    },
    sendParent: function (message){
      if (this.parentWindow) {
        this.parentWindow.postMessage(message, "*");
      }
    },
    send: function (action, message) {
      if ( this.connectedTo.length < 1 ) return;
      if (message === undefined) message = "";
      for (var i=0; i<this.connectedTo.length; i++) {
        if (this.connectedTo[i][0] == action) {
          var m;
          if (message.constructor === String) {
            m = "/"+this.connectedTo[i][2]+"/"+message;
          } else {
            m = {};
            m[this.connectedTo[i][2]] = message;
          }
          this.parentWindow.frames[this.connectedTo[i][1]].postMessage(m, "*");
        }
        if (this.connectedTo[i][0] == "default") {
          var m;
          if (message.constructor === String) {
            m = "/"+action+"/"+message;
          } else {
            m = {};
            m[action] = message;
          }
          this.parentWindow.frames[this.connectedTo[i][1]].postMessage(m, "*");
        }
      }
    },
    recieve: function (e) {
      if (e.data.constructor === String) {
        var message = e.data.split("/");
        if ( message[1] && meemoo.inputs.hasOwnProperty(message[1]) ) {
          meemoo.inputs[message[1]](message, e);
        } else {
          // No action specified or, not an OSC-like String
          meemoo.inputs["default"](message, e);
        }
      } else if (e.data.constructor === Object) {
        for (var name in e.data) {
          if (meemoo.inputs.hasOwnProperty(name)) {
            meemoo.inputs[name](e.data[name]);
          } else {
            meemoo.inputs["defaultData"](e.data);
          }
        }
      } else {
        // Not a String or Object... future imagedata & other fun
        meemoo.inputs["defaultData"](e.data);
      }
    },
    // Inputs are functions available for other modules to trigger
    addInput: function(name, input) {
      meemoo.inputs[name] = input.action;
      
      if (input.port === true || input.port === "true") {
        // Expose port
        var info = {name:name, type:input.type};
        this.sendParent("/addInput/"+encodeURIComponent(JSON.stringify(info)));
      }
    },
    addInputs: function(inputs) {
      for (var name in inputs) {
        meemoo.addInput(name, inputs[name]);
      }
    },
    inputs: {
      connect: function (edge) {
        var toIndex = parseInt(edge.target[0], 10);
        // Make sure it is number
        if (toIndex === toIndex) {
          meemoo.connectedTo.push([edge.source[1], toIndex, edge.target[1]]);
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
      },
      setState: function (message, e) {
        // Setup module with saved data
      },
      default: function (message, e) { 
        // console.log(message);
      },
      defaultData: function (data) { 
        // console.log(data);
      }
    },
    // Outputs
    addOutput: function(name, output) {
      meemoo.outputs[name] = output;
      
      if (output.port === true || output.port === "true") {
        // Expose port
        var info = {name:name, type:output.type};
        this.sendParent("/addOutput/"+encodeURIComponent(JSON.stringify(info)));
      }
    },
    addOutputs: function(outputs) {
      for (var name in outputs) {
        meemoo.addOutput(name, outputs[name]);
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
