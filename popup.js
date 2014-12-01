
var port = null;

var getKeys = function(obj) {
  var keys = [];
  for(var key in obj){
    keys.push(key);
  }
  return keys;
}

function appendMessage(text) {
  document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function updateUiState() {
  if (port){
    document.getElementById('connect-button').style.display = 'none';
    document.getElementById('input-text').style.display = 'block';
    document.getElementById('send-message-button').style.display = 'block';
    document.getElementById('ping-tee').style.display = 'block'
  } else {
    document.getElementById('connect-button').style.display = 'block';
    document.getElementById('input-text').style.display = 'none';
    document.getElementById('send-message-button').style.display = 'none';
    document.getElementById('ping-tee').style.display = 'none'
  }
}

function sendNativeMessage(message) {
  message = {"text": document.getElementById('input-text').value};
  port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
  updateUiState;
}

function connect() {
  var hostName = "com.intel.chrome.opentee.proxy";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>");
  port = chrome.runtime.connectNative(hostName);
  port.onDisconnect.addListener(onDisconnected);
  port.onMessage.addListener(onNativeMessage);
  updateUiState();
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('connect-button').addEventListener(
    'click', connect);
  document.getElementById('send-message-button').addEventListener(
    'click', sendNativeMessage);

  updateUiState();
});
