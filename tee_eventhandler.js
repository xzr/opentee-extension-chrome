
function onNativeMessage(msg) {
  appendMessage("Received message: <b>" + JSON.stringify(msg) + "</b>");
  tee_parse_json(msg);
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
