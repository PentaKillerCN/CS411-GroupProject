chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        addListener("*://www.whatever.com/*");
    }
});

//todo: get time frame of blocking, and dont block if its not within that time
var today = new Date;
//var blockDate = whatever;

//listener to listen for messages (new sites) from contentscript.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                
                var jsonStr = '{"urls":["*://www.whatever.com/*"]}';

                var obj = JSON.parse(jsonStr);
                
                //add url matching patterns to the urls from user input
                for (var i = 0; i < request.newSite.length; i++){
                    obj['urls'].push( '*://www.' + request.newSite[i] + '/*');
                }
                
               
                for (var k=0;k<obj['urls'].length;k++){
                    addListener(obj['urls'][k]);
                }                
  });
/* 
//this variable is a list of sites to be blocked, and is updated when addListener is called
function blockedUrls() {
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
                console.log(xt.urls);
                return xt.urls;
                //return JSON.stringify(jobj['urls']);
            } 
        });
        return ["*://www.whatever.com/*"];
} */




function callback_named() {
    return {cancel: true};
}

function addListener(newUrl){
    chrome.webRequest.onBeforeRequest.addListener(callback_named, {urls: [newUrl]},["blocking"]);
}


var now = new Date();

if (today < now.setDate(now.getDate()+7)){
    console.log("yes");
    chrome.webRequest.onBeforeRequest.removeListener(callback_named);
}
console.log("today: ", today);
console.log("today + 7: ", now.getDate());


//function to update the list of blocked sites whenever one is added
/* function addListener(newUrl){
    
    
    chrome.webRequest.onBeforeRequest.addListener(
      function(){ return {cancel: true}; },
      {
        urls: [newUrl]
      },
      ["blocking"]
      
    );
} */