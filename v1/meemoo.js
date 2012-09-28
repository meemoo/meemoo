/*

Meemoo.org hackable web apps
  by Forrest Oliphant

Copyright (c) 2012, Forrest Oliphant
Open-source MIT, AGPL

*/


(function(window, document, undefined){
  "use strict";
  
  if (window.Meemoo) {
    // Meemoo already loaded, don't bother
    return false;
  }
  
  var meemoo = {
    parentWindow: window.opener ? window.opener : window.parent ? window.parent : undefined,
    nodeid: undefined,
    sendThroughParent: true,
    setInfo: function (info) {
      var i = {};
      if (info.hasOwnProperty("title")) {
        i.title = info.title;
      } else if (document.title) {
        i.title = document.title;
      }
      if (info.hasOwnProperty("author")) {
        i.author = info.author;
      } else if (document.getElementsByName("author").length > 0 && document.getElementsByName("author")[0].content) {
        i.author = document.getElementsByName("author")[0].content;
      }
      if (info.hasOwnProperty("description")) {
        i.description = info.description;
      } else if (document.getElementsByName("description").length > 0 && document.getElementsByName("description")[0].content) {
        i.description = document.getElementsByName("description")[0].content;
      }
      meemoo.info = i;
      this.sendParent("info", i);

      // If addInputs() isn't called by 3 seconds, say ready
      var autoReady = setTimeout(function(){ 
        if (!meemoo.stateReadySent) {
          meemoo.sendParent("stateReady");
          meemoo.stateReadySent = true;
        }
      }, 3000);

      return meemoo;
    },
    sendParent: function (action, message){
      if (this.parentWindow) {
        var o = {};
        o[action] = message ? message : action;
        o.nodeid = meemoo.nodeid;
        this.parentWindow.postMessage(o, "*");
      }
    },
    send: function (action, message) {
      if ( action === undefined ) { 
        return; 
      }
      if (message === undefined) { message = action; }

      var m = {};
      m.output = action;
      m.value = message;
      this.sendParent("message", m);
    },
    set: function (name, value) {
      // This pushes a port's value to the iframework node state
      var m = {};
      m[name] = value;
      this.sendParent("set", m);
    },
    recieve: function (e) {
      var fromParent = (e.source === meemoo.parentWindow);
      for (var name in e.data) {
        if ( meemoo.inputs.hasOwnProperty(name) ) {
          meemoo.inputs[name](e.data[name], e);
        } else if ( fromParent && meemoo.frameworkActions.hasOwnProperty(name) ) {
          // Only do frameworkActions from the parent, not sibling modules
          meemoo.frameworkActions[name](e.data[name], e);
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
      portproperties.options = input.hasOwnProperty("options") ? input.options : "";
      portproperties["default"] = input.hasOwnProperty("default") ? input["default"] : "";
      
      if (input.port !== false) {
        // Expose port
        this.sendParent("addInput", portproperties);
      }
      return meemoo;
    },
    stateReadySent: false,
    addInputs: function(inputs) {
      for (var name in inputs) {
        if (inputs.hasOwnProperty(name)) {
          meemoo.addInput(name, inputs[name]);
        }
      }
      // Set all inputs, then ask for state
      this.sendParent("stateReady");
      this.stateReadySent = true;
      return meemoo;
    },
    inputs: {},
    // Outputs
    addOutput: function(name, output) {
      output.connected = false;
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
    outputs: {},
    connected: function(name) {
      // DEPRECATED 2012.09.28 ... iframework keeps track of connections
      // return meemoo.outputs.hasOwnProperty(name) && meemoo.outputs[name].connected;
      return true;
    },
    frameworkActions: {
      connect: function (edge) {
        // DEPRECATED 2012.09.28 ... iframework keeps track of connections
      },
      disconnect: function (edge) {
        // DEPRECATED 2012.09.28 ... iframework keeps track of connections
      },
      getState: function () {
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
  
  var showNote = function(){
    if(document.body && document.getElementById){
      var note = document.createElement("div");
      note.innerHTML = '<div style="color: #666; background-color:#FFE87C; border: 1px dotted #7d95ff; text-align:center; font-size:15px; padding:20px;">'+
        'You are looking are a Meemoo module that should be loaded in a Meemoo app.<br />'+ 
        'Check out <a href="http://meemoo.org/iframework/">meemoo.org/iframework</a> to see how it works. &lt;3'+
        '</div>';
      document.body.appendChild(note);
    } else {
      // body isn't ready, try again
      setTimeout(showNote, 100);
    }
  };

  if(window.name) {
    var split = window.name.split("_");
    // Set id from frame name frame_id
    var id = split[1];
    id = parseInt(id, 10);
    meemoo.nodeid = id;
  } else {
    // not in iframework, display message
    setTimeout(showNote, 100);
  }

  // requestAnimationFrame shim from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

  
  // Expose Meemoo to the global object
  window.Meemoo = meemoo;
  
}(window, document));
