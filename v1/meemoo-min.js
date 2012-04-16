/*

Meemoo web media wiring
  by Forrest Oliphant
    at Sembiki Interactive http://sembiki.com/
    and Media Lab Helsinki http://mlab.taik.fi/
    with Mozilla WebFWD http://webfwd.org/

Copyright (c) 2012, Forrest Oliphant

This file is part of Meemoo.
  
  Meemoo is free software: you can redistribute it and/or modify 
  it under the terms of the GNU Affero General Public License as 
  published by the Free Software Foundation, either version 3 of 
  the License, or (at your option) any later version.
  
  Meemoo is distributed in the hope that it will be useful, but 
  WITHOUT ANY WARRANTY; without even the implied warranty of 
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the 
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General 
  Public License along with Meemoo.  If not, see 
  <http://www.gnu.org/licenses/>.
  
*/(function(a){"use strict";if(a.Meemoo)return!1;var b={parentWindow:a.opener?a.opener:a.parent?a.parent:void 0,nodeid:undefined,connectedTo:[],setInfo:function(a){var c={};return a.hasOwnProperty("title")?c.title=a.title:document.title&&(c.title=document.title),a.hasOwnProperty("author")?c.author=a.author:document.getElementsByName("author").length>0&&document.getElementsByName("author")[0].content&&(c.author=document.getElementsByName("author")[0].content),a.hasOwnProperty("description")?c.description=a.description:document.getElementsByName("description").length>0&&document.getElementsByName("description")[0].content&&(c.description=document.getElementsByName("description")[0].content),b.info=c,this.sendParent("info",c),b},sendParent:function(a,c){if(this.parentWindow){var d={};d[a]=c?c:a,d.nodeid=b.nodeid,this.parentWindow.postMessage(d,"*")}},send:function(a,b){if(a===undefined||this.connectedTo.length<1)return;b===undefined&&(b=a);for(var c=0;c<this.connectedTo.length;c++)if(this.connectedTo[c].source[1]===a){var d;d={},d[this.connectedTo[c].target[1]]=b;var e=this.parentWindow.frames[this.connectedTo[c].target[0]];e?e.postMessage(d,"*"):console.error("module wat "+this.nodeid+" "+this.connectedTo[c].target[0])}},recieve:function(a){var c=a.source==b.parentWindow;if(a.data.constructor===Object)for(var d in a.data)b.inputs.hasOwnProperty(d)?b.inputs[d](a.data[d],a):c&&b.frameworkActions.hasOwnProperty(d)&&b.frameworkActions[d](a.data[d],a)},addInput:function(a,c){b.inputs[a]=c.action;var d={};return d.name=a,d.type=c.hasOwnProperty("type")?c.type:"",d.description=c.hasOwnProperty("description")?c.description:"",d.min=c.hasOwnProperty("min")?c.min:"",d.max=c.hasOwnProperty("max")?c.max:"",d.options=c.hasOwnProperty("options")?c.options:"",d.default=c.hasOwnProperty("default")?c.default:"",c.port!==!1&&this.sendParent("addInput",d),b},addInputs:function(a){for(var c in a)a.hasOwnProperty(c)&&b.addInput(c,a[c]);return this.sendParent("stateReady"),b},inputs:{},addOutput:function(a,c){return b.outputs[a]=c,c.port!==!1&&this.sendParent("addOutput",{name:a,type:c.type}),b},addOutputs:function(a){for(var c in a)a.hasOwnProperty(c)&&b.addOutput(c,a[c]);return b},outputs:{},frameworkActions:{connect:function(a){for(var c=0;c<b.connectedTo.length;c++){var d=b.connectedTo[c];if(d.source[0]===a.source[0]&&d.source[1]===a.source[1]&&d.target[0]===a.target[0]&&d.target[1]===a.target[1])return!1}b.connectedTo.push(a)},disconnect:function(a){var c=[];for(var d=0;d<b.connectedTo.length;d++){var e=b.connectedTo[d];(e.source[0]!==a.source[0]||e.source[1]!==a.source[1]||e.target[0]!==a.target[0]||e.target[1]!==a.target[1])&&c.push(e)}b.connectedTo=c},getState:function(){var a={};b.sendParent("state",a)},setState:function(a){for(var c in a)b.inputs.hasOwnProperty(c)&&b.inputs[c](a[c])}}};a.addEventListener("message",b.recieve,!1);var c=setTimeout(function(){document.body&&document.getElementById&&(b.info||b.setInfo({}))},2e3);if(a.name){var d=a.name.split("_")[1];d=parseInt(d,10),b.nodeid=d}var e=function(){if(document.body&&document.getElementById){var a=document.createElement("div");a.innerHTML='<div style="color: #666; background-color:#FFE87C; border: 1px dotted #7d95ff;">You are looking are a Meemoo module that should be loaded in a Meemoo app.Check out <a href="http://meemoo.org/iframework/">meemoo.org/iframework</a> to see how it works.</div>',document.body.appendChild(a)}else setTimeout(e,100)};a.Meemoo=b})(window);