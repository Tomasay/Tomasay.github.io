let projectIDs = ["70930257", "69444965", "70841453", "63792165", "63791773", "63503479", "63502575"];
window.onload = getData;

function getData(){
    let projects = document.getElementById("projects");

    const BEHANCE_URL = "https://www.behance.net/v2/projects/";

    //public API key
    const BEHANCE_KEY = "0fGEGMtzawy4t8b8kP8LXtizXksi86Ju";

    // build up our URL string
    let url = "https://www.behance.net/v2/users/thomasratlf5ed/projects?api_key=" + BEHANCE_KEY + "&callback=";
    
    console.log(url);
    
    //If there is already a parsed json stored, run method with it
    if(sessionStorage.getItem("behanceProjects")){
        jsonLoaded(sessionStorage.getItem("behanceProjects"));
    }
    
    //If not, run ajax to retrieve new json
    else{
        $.ajax({
                type: "GET",
                dataType: "jsonp",
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
        
        //If obj is  string, meaning it is already in storage, parse it to a json
        if(typeof obj == 'string'){
            //console.log("A STRING WAS DETECTED");
            obj = JSON.parse(obj);
        }
        
        //Set session storage for string version of json file, so that it doesn't need to be retrieved every time the page is refreshed
        sessionStorage.setItem("behanceProjects", JSON.stringify(obj));
        
        for(var i=0; i<obj.projects.length; i++){
            let link = obj.projects[i].url;
            let name = obj.projects[i].name;

            console.log("obj = " + obj);
            console.log("obj stringified = " + JSON.stringify(obj));

            let projectImageContainer = document.createElement("div");
            projectImageContainer.className = "projectImageContainer";
            projects.appendChild(projectImageContainer);

            let projectImage = document.createElement("img");
            projectImage.src = obj.projects[i].covers.original;
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
        
        
}
