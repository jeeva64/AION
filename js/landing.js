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

// ===============================
// Navbar Active Link Handler
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link").forEach(link => {
    const linkPath = link.getAttribute("href");

    if (
      linkPath === currentPath ||
      (currentPath === "" && linkPath === "/") ||
      (currentPath === "index.html" && linkPath === "/")
    ) {
      link.classList.add("text-blue-400", "font-semibold");
    }
  });
});


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

// AION 2K26 - Landing Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  
  // Mobile Menu Toggle
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const navbar = document.querySelector('.navbar');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      
      // Animate menu icon
      const icon = menuBtn.querySelector('.menu-icon');
      if (icon) {
        icon.style.transform = mobileMenu.classList.contains('active') 
          ? 'rotate(90deg)' 
          : 'rotate(0)';
      }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        const icon = menuBtn.querySelector('.menu-icon');
        if (icon) icon.style.transform = 'rotate(0)';
      }
    });
    
    // Close mobile menu when link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        const icon = menuBtn.querySelector('.menu-icon');
        if (icon) icon.style.transform = 'rotate(0)';
      });
    });
  }
  
  // Navbar scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
  
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe event cards for animation
  const eventCards = document.querySelectorAll('.event-card');
  eventCards.forEach(card => {
    observer.observe(card);
  });
  
  // Add parallax effect to hero orbs on mouse move
  const heroSection = document.querySelector('.hero-section');
  if (heroSection && window.matchMedia('(min-width: 768px)').matches) {
    heroSection.addEventListener('mousemove', (e) => {
      const orbs = document.querySelectorAll('.hero-orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 15;
        const xPos = (x - 0.5) * speed;
        const yPos = (y - 0.5) * speed;
        
        orb.style.transform = `translate(${xPos}px, ${yPos}px)`;
      });
    });
  }
  
});