console.log('you\'r in the world of content.js');

var cryptid = 1;

var script = document.createElement('script');
script.src = chrome.extension.getURL('gmail/inject.js');

script.onload = function() {
  this.parentNode.removeChild(this);
};

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
    });
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
