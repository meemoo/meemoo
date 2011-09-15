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
      data: "data" // default, any data
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
    send: function (message) {
      for (var i=0; i<this.connectedTo.length; i++) {
        this.parentWindow.frames[this.connectedTo[i]].postMessage(message, "*");
      }
    },
    recieve: function (e) {
      if (e.data.constructor == String) {
        var message = e.data.split("/");
        if ( message[1] && meemoo.actions.hasOwnProperty(message[1]) ) {
          meemoo.actions[message[1]](message, e);
        } else {
          // No action specified or, not an OSC-like String
          meemoo.actions["default"](message, e);
        }
      } else {
        // Not a String... future imagedata & other fun
        meemoo.actions["defaultData"](e.data);
      }
    },
    // Actions are functions available for other modules to trigger
    addAction: function(name, action) {
      meemoo.actions[name] = action.action;
      
      if (action.public === true || action.public === "true") {
        // Expose port
      }
    },
    addActions: function(actions) {
      for (name in actions) {
        meemoo.addAction(name, actions[name]);
      }
    },
    actions: {
      connect: function (message, e) {
        var toIndex = parseInt(message[2], 10);
        // Make sure it is number and not already connected
        if (toIndex === toIndex && meemoo.connectedTo.indexOf(toIndex) === -1) {
          meemoo.connectedTo.push(toIndex);
        }
      },
      disconnect: function (message, e) {
        var toIndex = parseInt(message[2], 10);
        var results = [];
        for(var i=0; i<meemoo.connectedTo.length; i++) {
          if (meemoo.connectedTo[i] != toIndex) {
            results.push(meemoo.connectedTo[i]);
          }
        }
        meemoo.connectedTo = results;
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
