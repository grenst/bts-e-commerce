import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

console.log('GSAP and ScrollTrigger initialized');