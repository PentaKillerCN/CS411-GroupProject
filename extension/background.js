chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        localStorage.setItem('blocks', JSON.stringify({urls: ['*://www.evil.com/*']}));
        addListener();
    }
});


//listener to listen for messages (new sites) from contentscript.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                localStorage.setItem('blocks', 'urls: *://www.yahoo.com/*'); //fix async. switch to chrome sync storage
                //request.newSite gives the message value
                addListener();
                
  });


var blockedUrls = function () {
    if (localStorage.blocks) {
        return JSON.parse(localStorage.blocks).urls //this is breaking. but it made it here!!
    } else {
        return ['*://www.facebook.com/*'];
    }
}

function addListener(){
    chrome.webRequest.onBeforeRequest.addListener(
      function(){ return {cancel: true}; },
      {
        urls: blockedUrls()
      },
      ["blocking"]
    );
}