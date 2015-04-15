function tee_parse_json(msg) {
  //check the mode we are on and do stuff based on that
  console.log(JSON.stringify(msg));

  //check if we are processing a request from extension
  if(g_replywaiting === true)
  {
    console.log("moi");
    console.log(msg.payload);
    var tmp = window.atob(msg.payload)
    g_reply({dataout:tmp});
    g_reply = null;
    g_replywaiting = false;
    return;
  }

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
