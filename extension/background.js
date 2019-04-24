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
                
                var jsonStr = '{"urls":["doesntexist.com"]}';

                var obj = JSON.parse(jsonStr);
                
                //add url matching patterns to the urls from user input
                for (var i = 0; i < request.newSite.length; i++){
                    obj['urls'].push( '*://www.' + request.newSite[i] + '/*');
                }
                
                //obj['urls'].push(request.newSite);
                
                
                
                jsonStr = JSON.stringify(obj);
                console.log("json:");
                console.log(jsonStr);
                
               
                
                chrome.storage.sync.set({'block': jsonStr}, function(){
                    //console.log(siteArr);
                    addListener();
                });
                //request.newSite gives the message value
                
                
  });

//this variable is a list of sites to be blocked, and is updated when addListener is called
var blockedUrls = function () {
        chrome.storage.sync.get(['block'], function(result) {
            if (typeof result.block === 'undefined') {
                //blocks is not yet set
                var jobj = ["*://www.whatever.com/*"];
                return [jobj[0]];
                console.log("not set");
            }
            else{
                //var jobj = JSON.parse(result.block);
                //console.log('SET');
                //console.log(jobj['urls']);
                //for i in jobj['urls']
                var xt = JSON.parse(result.block);
                console.log(JSON.stringify(xt.urls));
                return JSON.stringify(xt.urls);
                //return JSON.stringify(jobj['urls']);
            } 
        });
        return ["*://www.whatever.com/*"];
}

//function to update the list of blocked sites whenever one is added
function addListener(){
    // var pattern = "https://www.yahoo.com/"
    chrome.webRequest.onBeforeRequest.addListener(
      redirect,
      function(){ return {cancel: true}; },
      {
        urls: [blockedUrls()]//pattern]
      },
      ["blocking"]
    );
}

// The function I searched online, but I am not sure whether it helps
function redirect(requestDetails) {
  console.log("Redirecting: " + requestDetails.url);
  return {
      // Redirect to google.com. It could be redirected to our website.
    redirectUrl: "https://google.com"
  };
}