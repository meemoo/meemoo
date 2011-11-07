(function (window) {
  "use strict";
  
  if (window.Meemoo) {
    // Meemoo already loaded, don't bother
    return false;
  }
  
  var meemoo = {
    parentWindow: window.opener ? window.opener : window.parent ? window.parent : void 0,
    nodeid: undefined,
    connectedTo: [],
    setInfo: function (info) {
      var i = {};
      if (info.title) {
        i.title = info.title;
      } else if (document.title) {
        i.title = document.title;
      }
      if (info.author) {
        i.author = info.author;
      } else if (document.getElementsByName("author").length > 0 && document.getElementsByName("author")[0].content) {
        i.author = document.getElementsByName("author")[0].content;
      }
      if (info.description) {
        i.description = info.description;
      } else if (document.getElementsByName("description").length > 0 && document.getElementsByName("description")[0].content) {
        i.description = document.getElementsByName("description")[0].content;
      }
      meemoo.info = i;
      this.sendParent("info", i);
      return meemoo;
    },
    // ready: function () {
    //   
    // },
    sendParent: function (action, message){
      if (this.parentWindow) {
        var o = {};
        o[action] = message ? message : action;
        o["nodeid"] = meemoo.nodeid;
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
      return meemoo;
    },
    addInputs: function(inputs) {
      for (var name in inputs) {
        if (inputs.hasOwnProperty(name)) {
          meemoo.addInput(name, inputs[name]);
        }
      }
      // Set all inputs, then ask for state
      this.sendParent("stateReady");
      return meemoo;
    },
    inputs: {
      connect: function (edge) {
        // Make sure it is unique
        for(var i=0; i<meemoo.connectedTo.length; i++) {
          var thisEdge = meemoo.connectedTo[i];
          if (thisEdge.source[0] === edge.source[0] && thisEdge.source[1] === edge.source[1] && thisEdge.target[0] === edge.target[0] && thisEdge.target[1] === edge.target[1]) {
            // Not unique
            return false;
          }
        }
        // Make sure frame index is number
        var toIndex = parseInt(edge.target[0], 10);
        if (toIndex === toIndex) {
          meemoo.connectedTo.push(edge);
        }
      },
      disconnect: function (edge) {
        var results = [];
        for(var i=0; i<meemoo.connectedTo.length; i++) {
          var thisEdge = meemoo.connectedTo[i];
          // Only keep it if something is different
          if (thisEdge.source[0] !== edge.source[0] || thisEdge.source[1] !== edge.source[1] || thisEdge.target[0] !== edge.target[0] || thisEdge.target[1] !== edge.target[1]) {
            results.push(thisEdge);
          }
        }
        meemoo.connectedTo = results;
      },
      getState: function () {
        // (Overwrite this)
        // Send a state to parent, called when saving composition
        var state = {};
        meemoo.sendParent("state", state);
      },
      setState: function (state) {
        // (Overwrite this)
        // Setup module with saved data matching getState() returned object
        // Called when loading composition
      },
      all: function (message, e) { 
        // (Overwrite this for a default action)
        // console.log(message);
      }
    },
    // Outputs
    addOutput: function(name, output) {
      meemoo.outputs[name] = output;
      
      if (output.port === true || output.port === "true") {
        // Expose port
        this.sendParent("addOutput", {name:name, type:output.type});
      }
      return meemoo;
    },
    addOutputs: function(outputs) {
      for (var name in outputs) {
        if (outputs.hasOwnProperty(name)) {
          meemoo.addOutput(name, outputs[name]);
        }
      }
      return meemoo;
    },
    outputs: {
      
    }
  };
  
  window.addEventListener("message", meemoo.recieve, false);
  
  // Run this every 50ms to see if document is ready, then send info to parent
  // var checkLoaded = setInterval(function(){ 
  //   if(document.body && document.getElementById){
  //     clearInterval(checkLoaded);
  //     meemoo.ready();
  //   }
  // }, 50);
  
  // If no setInfo by module after 2 seconds, send defaults
  var autoInfo = setTimeout(function(){ 
    if(document.body && document.getElementById){
      if (!meemoo.info) {
        meemoo.setInfo({});
      }
    }
  }, 2000);
  
  // Set id from #id=id
  if(window.location.hash) {
    var hash = window.location.hash.substring(1);
    var items = hash.split("&");
    for (var i=0; i<items.length; i++) {
      var item = items[i].split("=");
      if (item[0] == "nodeid") {
        meemoo.nodeid = item[1];
      }
    }
  }
  
  
  // Expose Meemoo to the global object
  window.Meemoo = meemoo;
  
})(window);
