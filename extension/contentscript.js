//this script runs on the load of every page (change this), and listens for our blocksite button being pressed.
//it then intercepts the site name and passes it to our blocking api
console.log("hello");
document.addEventListener("DOMContentLoaded", function(){
    var buttonb = document.getElementById('blockButton');
    var textb = document.getElementById('blockText');
    if (buttonb){
        buttonb.addEventListener('click', function() {
            //console.log(textb.value);
            //pass the new site to be blocked to background.js
            chrome.runtime.sendMessage({newSite: textb.value}, function(response) {
                //console.log(response.farewell);
            });
        });
    }
});


