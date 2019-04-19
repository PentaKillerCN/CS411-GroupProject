chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        addListener();
    }
});


//listener to listen for messages (new sites) from contentscript.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                localStorage.setItem('block', JSON.stringify({urls: ['*://www.' + request.newSite +'/*']})); //switch to chrome sync storage
                //request.newSite gives the message value
                addListener();
                
  });

//this variable is a list of sites to be blocked, and is updated when addListener is called
var blockedUrls = function () {
    if (localStorage.block) {
        var jobj = JSON.parse(localStorage.block);
        console.log(jobj['urls'][0]);
        return [jobj['urls'][0]];
    } else {
        return ['*://www.facebook.com/*'];
    }
}

//function to update the list of blocked sites whenever one is added
function addListener(){
    chrome.webRequest.onBeforeRequest.addListener(
      function(){ return {cancel: true}; },
      {
        urls: blockedUrls()
      },
      ["blocking"]
    );
}