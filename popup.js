
var port = null;
var g_mode = null;

var mode_enum = Object.freeze( {
  "NOT_CONNECTED" : 0,
  "CONNECTED" : 1,
  "DECRYPT" : 2,
  "TEST" : 3
})

var getKeys = function(obj) {
  var keys = [];
  for(var key in obj){
    keys.push(key);
  }
  return keys;
}

function showMessage(text) {
  document.getElementById('mode-specific-msg').innerHTML = "<p>" + text + "</p>" + "<hr>";
}

function appendMessage(text) {
  document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function updateUiState() {
  var HIDE = 'none';
  var SHOW = 'block';

  //variables to control the visibility of different elements
  var show_connect = HIDE;
  var show_input_text = HIDE;
  var show_input_data = HIDE;
  var show_button_send = HIDE;
  var show_button_decrypt = HIDE;
  var show_button_test = HIDE;
  var show_response = HIDE;
  var show_mode_specific = SHOW;

  switch (g_mode) {
    case "NOT_CONNECTED":
      show_connect = SHOW;
      show_input_text = HIDE;
      show_input_data = HIDE;
      show_button_send = HIDE;
      show_button_decrypt = HIDE;
      show_button_test = HIDE;
      show_response = HIDE;
      show_mode_specific = SHOW;
      showMessage("Please connect to TEE");
      break;
    case "CONNECTED":
      show_connect = HIDE;
      show_input_text = HIDE;
      show_input_data = HIDE;
      show_button_send = HIDE;
      show_button_decrypt = SHOW;
      show_button_test = SHOW;
      show_response = SHOW;
      show_mode_specific = SHOW;
      showMessage("You are connected, please select mode");
      break;
    case "DECRYPT":
      show_connect = HIDE;
      show_input_text = SHOW;
      show_input_data = SHOW;
      show_button_send = SHOW;
      show_button_decrypt = SHOW;
      show_button_test = SHOW;
      show_response = SHOW;
      show_mode_specific = SHOW;
      showMessage("You are connected, DECRYPT mode");
      break;
    case "TEST":
      show_connect = HIDE;
      show_input_text = SHOW;
      show_input_data = HIDE;
      show_button_send = SHOW;
      show_button_decrypt = SHOW;
      show_button_test = SHOW;
      show_response = SHOW;
      show_mode_specific = SHOW;
      showMessage("You are connected, TEST mode");
      break;
    default:
      console.log("something went tits up");
      break;
  }

  document.getElementById('connect-button').style.display = show_connect;
  document.getElementById('input-text').style.display = show_input_text;
  document.getElementById('input-data').style.display = show_input_data;
  document.getElementById('send-message-button').style.display = show_button_send;
  document.getElementById('mode-select-decrypt').style.display = show_button_decrypt;
  document.getElementById('mode-select-test').style.display = show_button_test;
  document.getElementById('response').style.display = show_response;
  document.getElementById('mode-specific-msg').style.display = show_mode_specific;

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
  g_mode = "NOT_CONNECTED";
  updateUiState;
}

function onTestMode() {
  g_mode = "TEST";
  updateUiState();
}

function onDecryptMode() {
  g_mode = "DECRYPT";
  updateUiState();
}

function connect() {
  var hostName = "com.intel.chrome.opentee.proxy";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>");
  port = chrome.runtime.connectNative(hostName);
  port.onDisconnect.addListener(onDisconnected);
  port.onMessage.addListener(onNativeMessage);

  if (port){
    g_mode = "CONNECTED";
    appendMessage("CONNECTED to native messaging host <b>" + hostName + "</b>");
  }
  updateUiState();
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('connect-button').addEventListener(
    'click', connect);
  document.getElementById('send-message-button').addEventListener(
    'click', sendNativeMessage);
  document.getElementById('mode-select-decrypt').addEventListener(
    'click', onDecryptMode);
  document.getElementById('mode-select-test').addEventListener(
    'click', onTestMode);

  g_mode = "NOT_CONNECTED";
  updateUiState();
});
