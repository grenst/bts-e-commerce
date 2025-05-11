import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function setupBackgroundAnimations() {
  const circles = [
    { id: '#bg-circle-4', rotation: '+=10' }, // slow, CW
    { id: '#bg-circle-3', rotation: '-=35' }, // even faster, CCW
    { id: '#bg-circle-2', rotation: '+=20' }, // faster, CW
    { id: '#bg-circle-1', rotation: '-=10' }, // slow, CCW
  ];

  circles.forEach((circle) => {
    const element = document.querySelector(circle.id);
    if (element) {
      gsap.set(element, { transformOrigin: 'center center' });

      gsap.to(element, {
        rotation: circle.rotation,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    } else {
      console.warn(
        `Background circle element ${circle.id} not found for animation.`
      );
    }
  });
}

export { gsap, ScrollTrigger, setupBackgroundAnimations };

// console.log('GSAP and ScrollTrigger initialized'); // Optional: remove or keep for debugging
