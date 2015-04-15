console.log('you\'r in the world of replace.js');

var cryptid = 1;




var actualCode = '' +
function decrypt(id) {

	console.log('showing content(' + id + ')->');

	var element = document.getElementById(id);
	console.log(element.textContent);
	//console.log(element.textContent);
	var datatouncrypt = element.textContent.split('-')[0];

	// Make a simple request:
	chrome.runtime.sendMessage("knldjmfmopnpolahpmmgbagdohdnhkik", {datain:datatouncrypt},
	  function(response) {
        console.log('showing content(' + id + ')<-');
	    if (response.dataout) {
				console.log(response.dataout)
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

function reeeplace() {
	$( ".a3s:contains(crypted_stuff)" ).each(function() {


		cryptid = cryptid + 1;
		var cryid = "cryptid" + cryptid;
		var old_content = $(this).html();
		old_content = old_content.replace('crypted_stuff ','');
		old_content = old_content.replace('crypted_stuff','');

		$(this).empty().append("<div class='crypted' id='"+cryid+"'>" + old_content + "</div>");
		$(this).append("<div class='crypted_info' onclick='decrypt(\""+cryid+"\");style.visibility=\"hidden\";'>content is crypted, click here to show</div>");
		$(this).children(".crypted").css("visibility","hidden");
		$(this).children(".crypted_info").css("background-color","red");
		console.log('fd something');

	 });
//	$( ".a3s" ).children( ':contains(crypted_stuff)').each(function() {
//
//		var old_content = $(this).html();
//		//old_content = old_content.replace('crypted_stuff','vault_stuff');
//		$(this).empty().append("<div class='crypted'>" + old_content + "</div>");
//		$(this).append("<div class='crypted_info'>content is crypted</div>");
//		$(this).children(".crypted").css("visibility","hidden");
//		$(this).children(".crypted_info").css("background-color","red");
//		console.log('fd something');
//	 });

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
