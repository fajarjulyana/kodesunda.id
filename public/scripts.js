function toggleDarkMode() {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const blogPosts = document.querySelectorAll('.blog-post');
    const footer = document.querySelector('footer');

    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');

    navbar.classList.toggle('dark-mode');
    navbar.classList.toggle('light-mode');

    footer.classList.toggle('dark-mode');
    footer.classList.toggle('light-mode');

    blogPosts.forEach(post => {
        post.classList.toggle('dark-mode');
        post.classList.toggle('light-mode');
    });

    const icon = document.querySelector('.dark-mode-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function filterPosts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const posts = document.querySelectorAll('.blog-post');

    posts.forEach(post => {
        const title = post.getAttribute('data-title');
        const content = post.getAttribute('data-content');

        if (title.includes(searchInput) || content.includes(searchInput)) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
}
const texts = [
    "Sharing coding tutorials",
    "Tips and tricks for developers",
    "Exploring new technologies",
    "Join me on this journey"
];

let index = 0;
let charIndex = 0;
let currentText = "";
let isDeleting = false;

function typeEffect() {
    const animatedText = document.getElementById('animatedText');

    if (!isDeleting && charIndex <= texts[index].length) {
        // Tambahkan satu karakter pada teks
        currentText = texts[index].substring(0, charIndex);
        animatedText.textContent = currentText;
        charIndex++;
        setTimeout(typeEffect, 100); // Kecepatan mengetik
    } else if (isDeleting && charIndex > 0) {
        // Hapus satu karakter
        currentText = texts[index].substring(0, charIndex);
        animatedText.textContent = currentText;
        charIndex--;
        setTimeout(typeEffect, 50); // Kecepatan menghapus
    } else if (!isDeleting && charIndex > texts[index].length) {
        // Berhenti sejenak sebelum menghapus
        isDeleting = true;
        setTimeout(typeEffect, 2000); // Waktu jeda sebelum mulai menghapus
    } else if (isDeleting && charIndex === 0) {
        // Pindah ke teks berikutnya dan mulai mengetik lagi
        isDeleting = false;
        index = (index + 1) % texts.length;
        setTimeout(typeEffect, 500); // Waktu jeda sebelum mulai mengetik teks berikutnya
    }
}

// Mulai efek mengetik saat halaman dimuat
typeEffect();