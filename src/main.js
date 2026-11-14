import { content } from './content.js';
import { createScene } from './scene.js';

// ---------- Fill content ----------
document.title = `${content.name} | Portfolio`;
document.querySelectorAll('[data-name]').forEach((el) => (el.textContent = content.name));
document.querySelectorAll('[data-tagline]').forEach((el) => (el.textContent = content.tagline));

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const about = document.getElementById('about-text');
content.about.forEach((p) => about.append(el('p', null, p)));

const stats = document.getElementById('stats');
content.stats.forEach(({ value, label }) => {
  const s = el('div', 'stat');
  s.append(el('strong', null, value), el('span', null, label));
  stats.append(s);
});

const timeline = document.getElementById('experience-list');
content.experience.forEach(({ role, org, period, location, points }) => {
  const item = el('li', 'job card reveal');
  item.append(el('span', 'mono period', period));
  item.append(el('h4', null, role));
  item.append(el('p', 'org', `${org} · ${location}`));
  const ul = el('ul', 'points');
  points.forEach((pt) => ul.append(el('li', null, pt)));
  item.append(ul);
  timeline.append(item);
});
document.getElementById('other-experience').textContent = content.otherExperience;

const edu = document.getElementById('education-list');
content.education.forEach(({ degree, school, period }) => {
  const item = el('li', 'reveal');
  item.append(el('strong', null, degree), el('span', null, school + (period ? ` · ${period}` : '')));
  edu.append(item);
});

const certs = document.getElementById('cert-list');
content.certifications.forEach((c) => certs.append(el('li', null, c)));

const list = document.getElementById('project-list');
content.projects.forEach((p, i) => {
  const card = el('article', 'project card reveal tilt');
  card.style.setProperty('--accent', p.color);
  card.append(el('span', 'mono num', String(i + 1).padStart(2, '0')));
  card.append(el('h4', null, p.title));
  card.append(el('p', null, p.description));
  const tags = el('ul', 'tags');
  p.tags.forEach((t) => tags.append(el('li', 'mono', t)));
  card.append(tags);
  const links = el('div', 'links');
  if (p.link) Object.assign(links.appendChild(el('a', null, p.linkLabel || 'Live ↗')), { href: p.link, target: '_blank', rel: 'noopener' });
  if (p.repo) Object.assign(links.appendChild(el('a', null, 'Code ↗')), { href: p.repo, target: '_blank', rel: 'noopener' });
  if (links.children.length) card.append(links);
  list.append(card);
});

const skills = document.getElementById('skill-list');
content.skills.forEach((s, i) => {
  const chip = el('span', 'chip', s);
  chip.style.animationDelay = `${i * 0.12}s`;
  skills.append(chip);
});

const socials = document.getElementById('socials');
content.socials.forEach(({ label, url }) =>
  Object.assign(socials.appendChild(el('a', 'mono', label)), { href: url, target: '_blank', rel: 'noopener' })
);
document.getElementById('email-btn').href = `mailto:${content.email}`;

// ---------- Typing effect ----------
const typed = document.getElementById('typed');
let roleIdx = 0, charIdx = 0, deleting = false;
function type() {
  const word = content.roles[roleIdx];
  charIdx += deleting ? -1 : 1;
  typed.textContent = word.slice(0, charIdx);
  let delay = deleting ? 40 : 90;
  if (!deleting && charIdx === word.length) { deleting = true; delay = 1600; }
  else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % content.roles.length; delay = 300; }
  setTimeout(type, delay);
}
type();

// ---------- 3D scene ----------
const scene = createScene(document.getElementById('scene'));
scene.start();

const sections = [...document.querySelectorAll('main > section')];
function onScroll() {
  // Progress measured in "sections": 0 at home, 1 at about, ...
  const mid = window.scrollY + window.innerHeight / 2;
  let p = 0;
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i].offsetTop + sections[i].offsetHeight / 2;
    const b = sections[i + 1].offsetTop + sections[i + 1].offsetHeight / 2;
    if (mid >= a) p = i + Math.min((mid - a) / (b - a), 1);
  }
  scene.setScroll(p);
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal, .section-title').forEach((n) => io.observe(n));

// ---------- 3D tilt cards ----------
document.querySelectorAll('.tilt').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  });
  card.addEventListener('pointerleave', () => (card.style.transform = ''));
});

// ---------- Custom cursor ----------
const cursor = document.getElementById('cursor');
if (window.matchMedia('(pointer: fine)').matches) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add('on'); });
  (function follow() {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll('a, .tilt, .chip').forEach((n) => {
    n.addEventListener('pointerenter', () => cursor.classList.add('grow'));
    n.addEventListener('pointerleave', () => cursor.classList.remove('grow'));
  });
} else {
  cursor.remove();
}

// ---------- Loader ----------
window.addEventListener('load', () => document.getElementById('loader').classList.add('done'));
