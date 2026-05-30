const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#site-menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.dataset.open === 'true';
    menu.dataset.open = String(!isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menu.dataset.open = 'false';
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
