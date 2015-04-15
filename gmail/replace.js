console.log('you\'r in the world of replace.js');

var cryptid = 1;




var actualCode = '' +
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
//	var element = document.getElementById(id);
//	element.style.visibility = 'visible';
//	element.innerHTML = uncrypt(element.innerHTML);

}; + '';

var script = document.createElement('script');
script.textContent = actualCode;
(document.head||document.documentElement).appendChild(script);


var actualCode = '' +
function encrypt(id) {

        console.log('encrypting content(' + id + ')->');

        var element = document.getElementById(id);
        console.log(element.textContent);
                // Make a simple request:
        /*chrome.runtime.sendMessage("knldjmfmopnpolahpmmgbagdohdnhkik", {datatocrypt:element.textContent},
          function(response) {
        console.log('encrypting content(' + id + ')<-');
            if (response.dataout) {
              element.innerHTML="crypted_stuff " + response.dataout + "-";
            }
          });*/
				var port = chrome.runtime.connect("knldjmfmopnpolahpmmgbagdohdnhkik",{name: "opentee_dec"});
				port.postMessage({datatocrypt:element.textContent});
				port.onMessage.addListener(function(response) {
							console.log('encrypting content(' + id + ')<-');
						if (response.dataout) {
							console.log(response.dataout);
							element.textContent=response.dataout;
							element.style.visibility = 'visible';
						}
					});
}; + '';

var script = document.createElement('script');
script.textContent = actualCode;
(document.head||document.documentElement).appendChild(script);

function reeeplace() {
        $( ".a3s:contains(crypted_stuff)").each(function() {


                if($(this).hasClass("handled")) {

                } else {
                        $(this).addClass("handled")
                        cryptid = cryptid + 1;
                        var cryid = "cryptid" + cryptid;
                        var old_content = $(this).html().replace('crypted_stuff ','');
                        $(this).empty().append("<div class='crypted' id='"+cryid+"'>" + old_content + "</div>");
                        $(this).append("<div class='crypted_info' onclick='decrypt(\""+cryid+"\");style.visibility=\"hidden\";'>content is crypted, click here to show</div>");
                        $(this).children(".crypted").css("opacity","0.3");
                        $(this).children(".crypted_info").css("background-color","red");
                        console.log('added uncrypt button');
                }
         });

        $( ".editable").each(function() {
                if($(this).hasClass("encryption")) {

                } else {
                        $(this).addClass("encryption");
                        console.log("id" + $(this).attr('id') );
                        $(this).closest('tr').append("<td class='Ap'><div class='crypted_info' style=\"background-color:green;color:white\" onclick='encrypt(\""+$(this).attr('id') +"\");style.visibility=\"hidden\";'>encrypt</div></td>");
                }
        } );

}



reeeplace();

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
	reeeplace();
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  attributes: true
  //...
});
