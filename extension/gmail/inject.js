function encrypt(id) {
  console.log('encrypting content(' + id + ')->');

  var element = document.getElementById(id);
  console.log(element.textContent);

  var port = chrome.runtime.connect("knldjmfmopnpolahpmmgbagdohdnhkik",{name: "opentee_dec"});

  //TODO: base64 the message first
  port.postMessage({datatocrypt:element.textContent});
  port.onMessage.addListener(function(response) {
    console.log('encrypting content(' + id + ')<-');
    if (response.dataout) {
      console.log(response.dataout);
      element.textContent="crypted_stuff " + response.dataout + "-";
      element.style.visibility = 'visible';
    }
  });
};

function decrypt(id) {
  console.log('showing content(' + id + ')->');

  var element = document.getElementById(id);
  //console.log(element.textContent);
  var datatouncrypt = element.textContent.split('-')[0];
  // Make a simple request:
  var port = chrome.runtime.connect("knldjmfmopnpolahpmmgbagdohdnhkik",{name: "opentee_dec"});
  port.postMessage({datain:datatouncrypt});
  port.onMessage.addListener(function(response) {
    console.log('showing content(' + id + ')<-');
    if (response.dataout) {
      console.log(response.dataout);
      element.textContent=response.dataout;
      element.style.visibility = 'visible';
    }
  });
};
