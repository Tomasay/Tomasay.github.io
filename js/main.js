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
        closeButton.addEventListener("click", closeModule)
    }
}

function closeModule(){
    $('.modal').modal('hide');
}
