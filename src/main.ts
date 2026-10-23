import { initCarousel } from './features/carousel';
import { initHeader } from './features/header';
import { initMap } from './features/map';
import { initMenu } from './features/menu';
import { initModals } from './features/modal';
import { initPhotos } from './features/photos';
import { initReservation } from './features/reservation';
import { initStatus } from './features/status';
import { initToast } from './features/toast';
import { detectUserLanguage, saveLang, setLang, snapshotGerman } from './i18n';
import { $$ } from './lib/dom';

function initLanguageSwitch(): void {
  $$('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      setLang(button.dataset.lang ?? '');
      saveLang();
    });
  });
}

function boot(): void {
  snapshotGerman();
  initLanguageSwitch();
  initStatus();
  initHeader();
  initPhotos();
  initMenu();
  initCarousel();
  initModals();
  initReservation();
  initToast();
  initMap();
  $$('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  setLang(detectUserLanguage());
}

boot();
