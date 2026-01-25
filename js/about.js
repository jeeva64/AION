// Mobile Menu Toggle
document.getElementById("menuBtn")?.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

// Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Apply scroll animation to all cards
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = [
    '.stat-card',
    '.vision-card',
    '.mission-card',
    '.highlights-card',
    '.faculty-card'
  ];

  animateElements.forEach(selector => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('fade-in-on-scroll');
      element.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(element);
    });
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add shadow to navbar on scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.classList.add('shadow-lg');
  } else {
    nav.classList.remove('shadow-lg');
  }
});