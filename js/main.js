// Header scroll shadow
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Hamburger / Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileOverlay = document.getElementById('mobileOverlay');

function openMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('show');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('show');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);
mobileOverlay.addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-nav-link, .mobile-menu-footer .btn').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// Modal Oferta
const modal = document.getElementById('ofertaModal');
const modalClose = document.getElementById('modalClose');
const modalCta = document.getElementById('modalCta');

function showModal() { modal.classList.add('show'); }
function hideModal() { modal.classList.remove('show'); }

// Mostrar modal a los 1.5 segundos
setTimeout(showModal, 1500);

modalClose.addEventListener('click', hideModal);
modalCta.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

// Smooth scroll para anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 68; // header height
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// Fade-in animation on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .solution-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.25s ease';
    observer.observe(el);
});
