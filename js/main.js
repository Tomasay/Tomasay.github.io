window.onload = getData;
window.addEventListener('pageFullyLoaded', animateText);

function getData(){
    
    //Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    themeToggle.addEventListener("change", () => {
        
        const mode = themeToggle.checked ? "dark-mode" : "light-mode";
        const oppositeMode = themeToggle.checked ? "light-mode" : "dark-mode";
        
        document.body.classList.remove(oppositeMode);
        document.body.classList.add(mode);
        
        // Toggle in all iframes
        document.querySelectorAll("iframe").forEach(iframe => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframeDoc.body.classList.remove(oppositeMode);
                iframeDoc.body.classList.add(mode);
            } catch (e) {
                console.error("Unable to access iframe content:", e);
            }
        });
    });
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
      onUpdate: (self) => {
        const scrollPercentage = (self.progress * 100);
        console.log(`Scroll Percentage: ${scrollPercentage}%`);
        document.getElementById("arrow").style.opacity = 1 - Math.max(scrollPercentage / 20, 0);
      }
    });

    // Animate the fade-in effect
    gsap.utils.toArray(".fade-in").forEach((element) => {
      gsap.fromTo(
        element,
        {
          opacity: 0, // Start fully transparent
          y: 50,      // Start 50px below the final position
        },
        {
          opacity: 1, // Fade to fully visible
          y: 0,       // Move to its original position
          duration: 1, // Animation duration in seconds
          ease: "power1.out", // Smooth easing for the movement
          scrollTrigger: {
            trigger: element,  // Trigger animation based on each individual element
            start: "top 90%",  // Start when the element's top is 90% from the top of the viewport
            end: "bottom 60%", // End when the element's bottom is 60% from the top of the viewport
            toggleActions: "play none none reverse", // Play when entering, reverse when leaving
          },
        }
      );
    });
    
    //Smooth scrolling with links
    $('a[href*=\\#]').on('click', function(event){     
        event.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top - 55}, 1000);
    });
    
    let iframes = document.querySelectorAll("iframe");
    
    //console.log(iframes);
    
    for(let i = 0; i < iframes.length; i++){
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
    
    for(let i = 0; i < navLink.length; i++){
        //navLink[i].style.color = "AliceBlue";
    }
}
    
function animateText(){
        //Text effects
        // Wrap every letter in a span
        var textWrapper = document.querySelector('.ml11 .letters');
        textWrapper.innerHTML = textWrapper.textContent.replace(/(\S)/g, "<span class='letter'>$&</span>");
        textWrapper.style.opacity = 1;

        var textWrapper2 = document.querySelector('.ml11-2 .letters-2');
        //textWrapper2.innerHTML = textWrapper2.textContent.replace(/(\S)/g, "<span class='letter-2'>$&</span>");
        wrapLettersWithLink(textWrapper2);
        textWrapper2.style.opacity = 1;

        function wrapLettersWithLink(element) {
            let newHTML = '';
            for (let i = 0; i < element.textContent.length; i++) {
                //console.log(element.textContent[i]); 
                if(i == 20){
                    //newHTML += "<a href='https://www.vive.com/us/' target='_blank'><u>" + element.textContent[i];
                    newHTML += "<a href='https://www.vive.com/us/' target='_blank'><u><span class='letter-2'>" + element.textContent[i] + "</span>";
                }
                else if(i == element.textContent.length - 1){
                    newHTML += "<span class='letter-2'>" + element.textContent[i] + "</span></u></a>";
                    //newHTML += element.textContent[i] + "</u></a>";
                }
                else{
                    newHTML += "<span class='letter-2'>" + element.textContent[i] + "</span>";
                }
            }
            element.innerHTML = newHTML;
        }



        anime.timeline({loop: false})
          .add({
            targets: '.ml11 .line',
            scaleY: [0,1],
            opacity: [0.5,1],
            easing: "easeOutExpo",
            duration: 700
          })
          .add({
            targets: '.ml11 .line',
            translateX: [0, document.querySelector('.ml11 .letters').getBoundingClientRect().width + 10],
            easing: "easeOutExpo",
            duration: 700,
            delay: 100
          }).add({
            targets: '.ml11 .letter',
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 600,
            offset: '-=775',
            delay: (el, i) => 34 * (i+1)
          }).add({
            targets: '.line',
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo"
          });

        anime.timeline({loop: false})
          .add({
            targets: '.ml11-2 .line-2',
            scaleY: [0,1],
            opacity: [0.5,1],
            easing: "easeOutExpo",
            duration: 700,
            delay: 2000
          })
          .add({
            targets: '.ml11-2 .line-2',
            translateX: [0, document.querySelector('.ml11-2 .letters-2').getBoundingClientRect().width + 10],
            easing: "easeOutExpo",
            duration: 700,
            delay: 100
          }).add({
            targets: '.ml11-2 .letter-2',
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 600,
            offset: '-=775',
            delay: (el, i) => 34 * (i+1)
          }).add({
            targets: '.line-2',
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo",
            delay: 1000
          });
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