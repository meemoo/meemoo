(function () {
  var meemoo = {
    parentWindow: void 0,
    connectedTo: [],
    initialize: function () {
      this.parentWindow = window.opener ? window.opener : window.parent ? window.parent : void 0;
      window.addEventListener("message", this.recieve, false);
      var info = {
        "title": document.title,
        "author": document.getElementsByName("author")[0].content,
        "description": document.getElementsByName("description")[0].content
      };
      this.sendParent( "/info/"+encodeURIComponent(JSON.stringify(info)) );
    },
    connect: function (toIndex) {
      // Make sure it is an integer
      toIndex = parseInt(toIndex);
      if (toIndex == toIndex) {
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
      
    }
  };
  
  if (!window.$meemoo) {
    window.$meemoo=meemoo;
  }
  
})();
