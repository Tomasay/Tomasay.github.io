window.onload = getData;

function getData(){
    //Smooth scrolling with links
    $('a[href*=\\#]').on('click', function(event){     
        event.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top - 55}, 1000);
    });
    
    let iframes = document.querySelectorAll("iframe");
    
    //console.log(iframes);
    
    for(i=0; i<iframes.length; i++){
        let closeButton = iframes[i].contentDocument.querySelector("button");
        closeButton.addEventListener("click", closeModule);
    }
    
    overrideColors();
}

function closeModule(){
    $('.modal').modal('hide');
}

function overrideColors(){
    let navLink = document.getElementsByClassName("nav-link");
    
    for(i=0; i<navLink.length; i++){
        navLink[i].style.color = "AliceBlue";
    }
}

function toggleProjects(){
    if(document.getElementById("experimentsButton").classList.contains('btn-custom-active')){
        document.getElementById("experimentsButton").classList.remove('btn-custom-active');
        document.getElementById("experimentsButton").classList.add('btn-custom');
    }
    
    if(document.getElementById("projectsButton").classList.contains('btn-custom')){
        document.getElementById("projectsButton").classList.remove('btn-custom');
        document.getElementById("projectsButton").classList.add('btn-custom-active');
    }
    
    document.getElementById("projects").style.display = "block";
    document.getElementById("experiments").style.display = "none";
}

function toggleExperiments(){
    if(document.getElementById("experimentsButton").classList.contains('btn-custom')){
        document.getElementById("experimentsButton").classList.remove('btn-custom');
        document.getElementById("experimentsButton").classList.add('btn-custom-active');
    }
    
    if(document.getElementById("projectsButton").classList.contains('btn-custom-active')){
        document.getElementById("projectsButton").classList.remove('btn-custom-active');
        document.getElementById("projectsButton").classList.add('btn-custom');
    }
    
    document.getElementById("projects").style.display = "none";
    document.getElementById("experiments").style.display = "block";
}

/*
function browserChanges(){
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    
    //Another shot at detecting safari
    if(!isSafari){
        isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
    }
    
    if(isFirefox){
        let bois = document.querySelectorAll(".col-lg");
        for(i=0; i<bois.length; i++){
            bois[i].classList.add("firefox");
        }
    }
    else if(isSafari){
        let bois = document.querySelectorAll(".col-lg");
        for(i=0; i<bois.length; i++){
            bois[i].classList.add("safari");
        }
    }
}
*/