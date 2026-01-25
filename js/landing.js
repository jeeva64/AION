// ================================================
// AION 2K26 Landing Page - Interactive Elements
// ================================================

// Mobile Menu Toggle
document.getElementById("menuBtn")?.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});

// Scroll Animations for Event Cards
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Apply scroll animation to event cards
document.querySelectorAll('.event-card').forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = `all 0.6s ease ${index * 0.1}s`;
  observer.observe(card);
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

// Add active state to navigation on scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.classList.add('shadow-lg');
  } else {
    nav.classList.remove('shadow-lg');
  }
});

// ================================================
// Additional Enhancements
// ================================================

// Parallax effect for hero orbs
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const orbs = document.querySelectorAll('.hero-orb');
  
  orbs.forEach((orb, index) => {
    const speed = 0.3 + (index * 0.1);
    orb.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Stat counter animation
const animateCounter = (element, target, duration = 2000) => {
  let current = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
};

// Observe stat cards and trigger counter animation
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      const value = entry.target.getAttribute('data-value');
      if (value) {
        animateCounter(entry.target, parseInt(value));
        entry.target.classList.add('counted');
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-value').forEach(stat => {
  statObserver.observe(stat);
});