chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        addListener();
    }
});

//todo: will have to get the block list from the table displayed on the page dom lol
//and actually iterate over it rather than just get the one item


//listener to listen for messages (new sites) from contentscript.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                
                chrome.storage.sync.set({'block': JSON.stringify({urls: ['*://www.' + request.newSite[0] +'/*']})}, function(){
                    addListener();
                });
                //request.newSite gives the message value
                
                
  });

//this variable is a list of sites to be blocked, and is updated when addListener is called
var blockedUrls = function () {
        chrome.storage.sync.get('block', function(result) {
            if (typeof result.block === 'undefined') {
                //blocks is not yet set
                var jobj = ["*://www.whatever.com/*"];
                return [jobj[0]];
                console.log("not set");
            }
            else{
                var jobj = JSON.parse(result.block);
                console.log('SET');
                console.log(jobj['urls'][0]);
                return [jobj['urls'][0]];
            } 
        });
        return ["*://www.whatever.com/*"];
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