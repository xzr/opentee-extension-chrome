var g_port = null;
var g_mode = null;

var mode_enum = Object.freeze( {
  "NOT_CONNECTED" : 0,
  "CONNECTED" : 1,
  "DECRYPT" : 2,
  "TEST" : 3
})

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

//this function passes the message to the parser which passes it to appropriate crypto function
//which in turn passes it to the CA
function sendNativeMessage(message) {
  message = {"text": document.getElementById('input-text').value};
  g_port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}


function connect() {
  var hostname = "com.intel.chrome.opentee.proxy";
  appendMessage("Connecting to native messaging host <b>" + hostname + "</b>");
  var ret = tee_connect(hostname);

  if (ret){
    g_mode = "CONNECTED";
    appendMessage("CONNECTED to native messaging host <b>" + hostname + "</b>");
  }
  updateUiState();
}

function loadScript(name) {
  var script = document.createElement('script');
  script.setAttribute("type","text/javascript");
  //script.setAttribute("src",name);
  script.src = chrome.extension.getURL(name);
  document.head.appendChild(script);
  //document.getElementsByTagName("head")[0].appendChild( script );
}

document.addEventListener('DOMContentLoaded', function () {
  //load libs
  //loadScript("tee_crypto.js");
  //loadScript("tee_eventhandler.js");
  //loadScript("tee_messaging.js");

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
