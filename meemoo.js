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
            // Sends an OSC-like string: "/actionName/data"
            m = "/"+this.connectedTo[i].target[1]+"/"+encodeURIComponent(message);
          } else {
            // Sends an object: {actionName:data}
            m = {};
            m[this.connectedTo[i].target[1]] = message;
          }
          this.parentWindow.frames[this.connectedTo[i].target[0]].postMessage(m, "*");
        }
      }
    },
    recieve: function (e) {
      var fromParent = (e.source == meemoo.parentWindow);
      if (e.data.constructor === String) {
        var message = e.data.split("/");
        if (!message[1]){
          return false;
        }
        if ( meemoo.inputs.hasOwnProperty(message[1]) ) {
          meemoo.inputs[message[1]](decodeURIComponent(message[2]), e);
        } else if ( fromParent && meemoo.frameworkActions.hasOwnProperty(message[1]) ) {
          // Only do frameworkActions from the parent, not modules
          meemoo.frameworkActions[message[1]](decodeURIComponent(message[2]), e);
        }
      } else if (e.data.constructor === Object) {
        for (var name in e.data) {
          if ( meemoo.inputs.hasOwnProperty(name) ) {
            meemoo.inputs[name](e.data[name], e);
          } else if ( fromParent && meemoo.frameworkActions.hasOwnProperty(name) ) {
            // Only do frameworkActions from the parent, not sibling modules
            meemoo.frameworkActions[name](e.data[name], e);
          }
        }
      }
    },
    // Inputs are functions available for other modules to trigger
    addInput: function(name, input) {
      meemoo.inputs[name] = input.action;
      
      var portproperties = {};
      portproperties.name = name;
      portproperties.type = input.hasOwnProperty("type") ? input.type : "";
      portproperties.description = input.hasOwnProperty("description") ? input.description : "";
      portproperties.min = input.hasOwnProperty("min") ? input.min : "";
      portproperties.max = input.hasOwnProperty("max") ? input.max : "";
      portproperties.default = input.hasOwnProperty("default") ? input.default : "";
      
      if (input.port !== false) {
        // Expose port
        this.sendParent("addInput", portproperties);
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
      
    },
    // Outputs
    addOutput: function(name, output) {
      meemoo.outputs[name] = output;
      
      if (output.port !== false) {
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
      
    },
    frameworkActions: {
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
        //TODO save these as they are input?
        // Send a state to parent, called when saving composition
        var state = {};
        meemoo.sendParent("state", state);
      },
      setState: function (state) {
        // Setup module with saved data matching getState() returned object
        // Called when loading composition
        for (var name in state) {
          if (meemoo.inputs.hasOwnProperty(name)) {
            meemoo.inputs[name](state[name]);
          }
        }
      }
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
