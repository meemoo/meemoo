(function () {
  var meemoo = {
    parentWindow: void 0,
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
    connect: function (toIndex) {
      toIndex = Number(toIndex);
      // make sure it is number and not already connected
      if (toIndex === toIndex && this.connectedTo.indexOf(toIndex) === -1) {
        this.connectedTo.push(toIndex);
      }
    },
    disconnect: function (toIndex) {
      var results = [];
      for(var i=0; i<this.connectedTo.length; i++) {
        if (this.connectedTo[i] != toIndex) {
          results.push(this.connectedTo[i]);
        }
      }
      this.connectedTo = results;
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
      var message = e.data.split("/");
      if( $meemoo.actions.hasOwnProperty(message[1]) ) {
        $meemoo.actions[message[1]](message);
      } else {
        $meemoo.actions["default"](e.data);
      }
    },
    // Define your actions like: $meemoo.actions.hello = function (e) { console.log(e); };
    actions: {
      default: function (e) { console.log(e); }
    },
  };
  
  meemoo.parentWindow = window.opener ? window.opener : window.parent ? window.parent : void 0;
  window.addEventListener("message", meemoo.recieve, false);
  
  if (!window.$meemoo) {
    window.$meemoo=meemoo;
  }
  
})();
