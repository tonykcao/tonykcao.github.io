document.getElementById('hamburger').addEventListener('click', function () {
    var navLinks = document.getElementById('nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});
var images = document.querySelectorAll('.gallery-grid img');
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');
images.forEach(function(img){
    img.addEventListener('click', function(){
        lightbox.style.display = 'flex';
        lightboxImg.src = this.src;
    });
});
lightbox.addEventListener('click', function(){
    lightbox.style.display = 'none';
});
