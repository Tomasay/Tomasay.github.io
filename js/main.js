gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', getData);
window.addEventListener('pageFullyLoaded', pageFullyLoaded);

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
    
    overrideColors();

    // Lazy-load the project pages: each is full of autoplay videos, so they
    // only load when their modal opens and unload again on close. Loading
    // them all at page open exhausts mobile video decoders / GPU memory
    // (black videos, lost WebGL context).
    // Must use jQuery's .on() because Bootstrap 4 fires modal events through
    // jQuery's event system, which jQuery 1.x does not propagate to native addEventListener.
    $('.modal').on('show.bs.modal', function() {
        const iframe = this.querySelector('iframe[data-src]');
        if (!iframe) return;
        iframe.addEventListener('load', () => {
            try {
                const closeButton = iframe.contentDocument.querySelector('button');
                if (closeButton) closeButton.addEventListener('click', closeModule);
            } catch (e) {
                console.error('Could not wire modal close button:', e);
            }
        }, { once: true });
        iframe.src = iframe.dataset.src;
    });

    // Unloading the iframe stops all media inside it (videos, Google Drive
    // embeds) and releases its decoders and memory.
    $('.modal').on('hidden.bs.modal', function() {
        const iframe = this.querySelector('iframe[data-src]');
        if (!iframe) return;
        iframe.src = 'about:blank';
    });
}

function pageFullyLoaded(){
    
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
    
    ScrollTrigger.create({
      onUpdate: (self) => {
        const scrollPercentage = (self.progress * 100);
        //console.log(`Scroll Percentage: ${scrollPercentage}%`);
        document.getElementById("arrow").style.opacity = 1 - Math.max(scrollPercentage / 20, 0);
      }
    });
    
    //Smooth scrolling with links
    $('a[href*=\\#]').on('click', function(event){     
        event.preventDefault();
        $('html,body').animate({scrollTop:$(this.hash).offset().top - 55}, 1000);
    });
    
    // The project-grid videos don't autoplay (14 simultaneous decoders at
    // page load evict the WebGL context on mobile). Instead, play each one
    // only while it's on-screen.
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { rootMargin: '200px' });
        document.querySelectorAll('main video').forEach((v) => videoObserver.observe(v));
    }

    animateText();
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
        ScrollTrigger.refresh();
        //Text effects
        // Wrap every letter in a span
        var textWrapper = document.querySelector('.ml11 .letters');
        textWrapper.innerHTML = textWrapper.textContent.replace(/(\S)/g, "<span class='letter'>$&</span>");
        textWrapper.style.opacity = 1;

        var textWrapper3 = document.querySelector('.ml11-3 .letters-3');
        wrapLettersWithLink(textWrapper3);
        textWrapper3.style.opacity = 1;
        var numLetters3 = textWrapper3.querySelectorAll('.letter-3').length;

        function wrapLettersWithLink(element) {
            const text = element.textContent;
            let newHTML = '';
            for (let i = 0; i < text.length; i++) {
                if (i === 20) {
                    newHTML += "<a href='https://www.meta.com/' target='_blank'><u><span class='letter-3'><i class='fa-brands fa-meta'></i>" + text[i] + "</span>";
                } else if (i === 24) {
                    newHTML += "<span class='letter-3'>" + text[i] + "</span></u></a>";
                } else {
                    newHTML += "<span class='letter-3'>" + text[i] + "</span>";
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

        document.fonts.ready.then(() => {
          anime.timeline({loop: false})
            .add({
              targets: '.ml11-3 .line-3',
              scaleY: [0,1],
              opacity: [0.5,1],
              easing: "easeOutExpo",
              duration: 700,
              delay: 2000
            })
            .add({
              targets: '.ml11-3 .line-3',
              translateX: [0, document.querySelector('.ml11-3 .letters-3').getBoundingClientRect().width + 10],
              easing: "easeOutExpo",
              duration: 36 * numLetters3,
              delay: 100
            }).add({
              targets: '.ml11-3 .letter-3',
              opacity: [0,1],
              easing: "easeOutExpo",
              duration: 600,
              offset: '-=' + (34 * numLetters3 + 75),
              delay: (el, i) => 16 * (i+1)
            }).add({
              targets: '.line-3',
              opacity: 0,
              duration: 1000,
              easing: "easeOutExpo",
              delay: 1000
            });
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