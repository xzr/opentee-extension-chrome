//parses json received from CA


function tee_parse_json(msg) {
  //check the mode we are on and do stuff based on that
  console.log(JSON.stringify(msg));
  switch (g_mode) {
    case "NOT_CONNECTED":
      //do nothing
      break;
    case "CONNECTED":
      //do nothing
      break;
    case "DECRYPT":
      //update the output with payload
      console.log("i should be in decrypt mode")
      displayResponse(window.atob(msg.payload));
      break;
    case "ENCRYPT":
      //update the output with payload
      displayResponse(msg.payload);
      break;
    case "TEST":
      //do nothing
      break;
    case "ADDKEY":
      //do noTYHINTHINTHgh
      break;
  }
}

function onNativeMessage(msg) {
  appendMessage("Received message: " + JSON.stringify(msg));
  var wtf = msg;
  tee_parse_json(wtf);
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  tee_disconnect();
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

function onEncryptMode() {
  g_mode = "ENCRYPT";
  updateUiState();
}

function onAddkeyMode() {
  g_mode = "ADDKEY";
  updateUiState();
}
