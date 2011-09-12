(function () {
  
  if (window.$meemoo) {
    return false;
  }
  
  var meemoo = {
    parentWindow: window.opener ? window.opener : window.parent ? window.parent : void 0,
    connectedTo: [],
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
          meemoo.actions["default"](message, e);
        }
      }
    },
    // Actions are functions available for other modules to trigger
    // Define custom actions like: $meemoo.actions.consolelog = function (e) { console.log(e); };
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
      default: function (message, e) { }
    },
  };
  
  window.addEventListener("message", meemoo.recieve, false);
  
  var checkLoaded = setInterval(function(){ 
    if(document.body && document.getElementById){
      clearInterval(checkLoaded);
      meemoo.ready();
    }
  },10);
  
  window.$meemoo = meemoo;
  
})();
