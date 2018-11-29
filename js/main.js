let projectIDs = ["70930257", "69444965", "70841453", "63792165", "63791773", "63503479", "63502575"];
window.onload = getData;

function getData(){
    let projects = document.getElementById("projects");
    
    
    var PROXY_URL = "proxy.php?format=json&filename=";

    const BEHANCE_URL = "https://www.behance.net/v2/projects/";

    //public API key
    const BEHANCE_KEY = "0fGEGMtzawy4t8b8kP8LXtizXksi86Ju";

    // build up our URL string
    let url = "";

    for(var i=projectIDs.length-1; i>=0; i--){

        url = BEHANCE_URL;
        
        url += projectIDs[i];

        url += "?api_key=" + BEHANCE_KEY;

        // 11 what the url looks like
        console.log(url);

        console.log(jQuery);
        console.log($); // $ is an alias to the jQuery object

        // Tell jQuery to download the data
        $.ajax({
            type: "GET",
            dataType: "json",
            url: url,
            success: jsonLoaded,
            error: function(xhr, error, status) {
                            console.log(error);
                            console.log(status);
                        }
        });
    }
}

    function jsonLoaded(obj){
        
        let link = obj.project.url;
        let name = obj.project.name;
        
        console.log("obj = " + obj);
        console.log("obj stringified = " + JSON.stringify(obj));
        
        console.log(obj.project.covers);
        
        let projectImageContainer = document.createElement("div");
        projectImageContainer.className = "projectImageContainer";
        projects.appendChild(projectImageContainer);
        
        let projectImage = document.createElement("img");
        projectImage.src = obj.project.covers.original;
        projectImageContainer.appendChild(projectImage);
        
        let overlay = document.createElement("div");
        overlay.className = "overlay";
        projectImageContainer.appendChild(overlay);
        
        let imageText = document.createElement("div");
        imageText.className = "imageText";
        imageText.innerHTML = name;
        overlay.appendChild(imageText);
        
        overlay.addEventListener("click", function(){
            window.open(link, '_blank');
        });
}
