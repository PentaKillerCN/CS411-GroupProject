chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        localStorage.setItem('blocks', JSON.stringify({urls: ['*://www.evil.com/*']}));
    }
});


//listener to listen for messages (new sites) from contentscript.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                localStorage.setItem('blocks', '*://www.yahoo.com/*'); //fix async. talk to perry?
                //request.newSite gives the message value
                
  });


var blockedUrls = function () {
    if (localStorage.blocks) {
        return JSON.parse(localStorage.blocks).urls
    } else {
        return ['*://www.facebook.com/*'];
    }
}


chrome.webRequest.onBeforeRequest.addListener(
  function(){ return {cancel: true}; },
  {
    urls: blockedUrls()
  },
  ["blocking"]
);
