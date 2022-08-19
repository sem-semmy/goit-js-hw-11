// import './sass/main.scss';

import scroll from './js/scroll';
import topArrow from './js/lift-up';

import fetchPixabay from './js/fetch-pixabay';
import cardTemplate from './template-card.hbs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  goTopBtn: document.querySelector('.lift_up'),
  endcollectionText: document.querySelector('.end-collection-quote'),
};


topArrow();

refs.searchForm.addEventListener('submit', e => {
  refs.gallery.innerHTML = '';
  onFormSubmit(e);
  refs.loadMoreBtn.classList.add('is-hidden');
});

let searchingData = '';
let page = 1;
let perPage = 0;

async function onFormSubmit(e) {
  e.preventDefault();

  searchingData = e.currentTarget.searchQuery.value;
  page = 1;
  if (searchingData.trim() === '') {
    Notify.failure('ВВеди щось більш коректніше');
    return;
  }
  const response = await fetchPixabay(searchingData, page);
  perPage = response.hits.length;

  if (response.totalHits <= perPage) {
    addISHidden();
  } else {
    removeIsHidden();
  }

  if (response.totalHits === 0) {
    clearGalleryHTML();
    refs.endcollectionText.classList.add('is-hidden');
    Notify.failure('Вибач, але я не хочу це шукати');
  }
  try {
    if (response.totalHits > 0) {
      Notify.info(
        `Чудово, можу тобі запропонувати ${response.totalHits} зображень ✨`
      );
      clearGalleryHTML();
      renderCard(response.hits);
    }
  } catch (error) {
    console.log(error);
  }
}

refs.loadMoreBtn.addEventListener('click', loadMore);

async function loadMore() {
  try {
    refs.loadMoreBtn.disabled = true;
    pageIncrement();
    const response = await fetchPixabay(searchingData, page);

    renderCard(response.hits);
    perPage += response.hits.length;
    scroll();

    if (perPage >= response.totalHits) {
      Notify.failure('Зображення закінчились');
      addISHidden();
    }
    refs.loadMoreBtn.disabled = false;
  } catch (error) {
    console.log(error);
  }
}
function addISHidden() {
  refs.loadMoreBtn.classList.add('is-hidden');
  refs.endcollectionText.classList.remove('is-hidden');
}
function removeIsHidden() {
  refs.loadMoreBtn.classList.remove('is-hidden');
  refs.endcollectionText.classList.add('is-hidden');
}
function pageIncrement() {
  page += 1;
}
function clearGalleryHTML() {
  refs.gallery.innerHTML = '';
}
function lightbox() {
  let lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });
  lightbox.refresh();
}
function renderCard(array) {
  const cardMarkup = array.map(item => cardTemplate(item)).join('');
  refs.gallery.insertAdjacentHTML('beforeend', cardMarkup);
  lightbox();
}
