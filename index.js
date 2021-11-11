'use strict';

// VARS
//////////////////////////////

// DOM vars
const searchCollection = document.querySelector('.search__collection');
const searchInput = document.querySelector('.search__input');
const searchResult = document.querySelector('.search__result');
const showercase = document.querySelector('.showercase');

// Data vars
let champNames;

// FUNCTIONS
//////////////////////////////

const autocompleteMatch = function (string, arr) {
  const input = string;
  if (input == '') {
    return [];
  }
  // Giving string array of champ names as an argument for our regex, second argument to say has to be case insensitive
  const reg = new RegExp(input, 'i');
  return arr.filter((term) => {
    if (term.match(reg)) {
      return term;
    }
  });
};

class Card {
  constructor(champ) {
    this.id = Date.now();
    this.html = this.createCard(champ).then((html) => (this.html = html));
  }

  async getChamp(champ) {
    try {
      const req = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/11.21.1/data/en_US/champion/${champ}.json`
      );
      const res = await req.json();
      return res.data[champ];
    } catch (e) {
      console.error(`MANAGED: ${e}`);
    }
  }

  populateCard(champ) {
    return `<article class="card" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${
      champ.id
    }_0.jpg');">
      <div class="card__pin--up"></div>
    <h1 class="card__name">${champ.name}</h1>
    <h2 class="card__title">${champ.title}</h2>
    <div class="card__tag-container">
      ${champ.tags
        .map((el) => '<h3 class="card__tags">'.concat(el).concat('</h3>'))
        .join()
        .replace(',', '')}
    </div>
    <p class="card__lore">
    ${champ.lore}
    </p>
    </article>`;
  }

  renderCard = async function (dom) {
    const html = await this.html;
    dom.insertAdjacentHTML('afterbegin', html);
    const card = document.querySelector('.card');
    card.classList.add('load');
  };

  renderCard2 = function (dom) {
    dom.insertAdjacentHTML('beforeend', this.html);
    const card = document.querySelector(
      `.card[data-id="${this.id}"]>.card__pin--up`
    );
    card.classList.remove('card__pin--up');
    card.classList.add('card__pin--down');
  };

  disruptCard = function () {
    const card = document.querySelector('.card');
    card.classList.remove('load');
    card.classList.add('unload');
  };

  disruptCard2 = function () {
    const card = document.querySelector(`.card[data-id="${this.id}"]`);
    card.remove();
  };

  createCard = async function (champ) {
    const dataChamp = await this.getChamp(champ);
    const htmlCard = this.populateCard(dataChamp);
    return htmlCard;
  };

  static deck = [];
  addDeck = function (card) {
    Card.deck.push(card);
    const a = this.html.split('article');
    const b = ` data-id="${this.id}" `;
    this.html = a[0] + 'article' + b + a[1] + 'article' + a[2];
  };

  static removeDeck = function (index) {
    const cardDeleted = Card.deck.splice(index, 1);
    cardDeleted[0].disruptCard2();
  };
}

// MAIN
//////////////////////////////

// Fetching data to fill autocomplete db
(async function () {
  try {
    const req = await fetch(
      'https://ddragon.leagueoflegends.com/cdn/11.21.1/data/en_US/champion.json'
    );
    const res = await req.json();
    champNames = Object.keys(res.data);
  } catch (e) {
    console.error(`MANAGED [autocomplete func not available]: ${e}`);
  }
})();

let newCard;

// Event Listener Delegator
document.addEventListener('click', (e) => {
  // Manage the digit on the search list component
  if (e.target === searchInput) {
    searchInput.addEventListener('input', (ev) => {
      // To avoid to trigger again the event passed by main event listener into this one.
      // To see what happen just comment the next command and uncomment the next to it.
      // What difference between stopPropagation and stopImmediatePropagation??
      ev.stopImmediatePropagation();
      // console.log(e.clientY);
      let matchedItems = autocompleteMatch(searchInput.value, champNames);
      searchCollection.innerHTML = '';
      matchedItems.forEach((el) => {
        const searchItemHTML = `<span class="search__item" data-champ="${el}">${el}</span>`;
        // To avoid collecting multiple times items that already match with the input search
        if (
          document.querySelectorAll(`[data-champ=${el}]`)[0] !== searchItemHTML
        )
          searchCollection.insertAdjacentHTML('beforeend', searchItemHTML);
      });
    });
  } else {
    searchCollection.innerHTML = '';
  }

  // Manage the click on the searched champ by populating the card with the info relying on the searched champion
  if (e.target.className === 'search__item') {
    searchInput.value = e.target.innerText;
    newCard = new Card(searchInput.value);
    if (searchResult.innerHTML !== '') searchResult.innerHTML = '';
    newCard.renderCard(searchResult);
  }

  if (e.target.className === 'card__pin--up') {
    newCard.addDeck(newCard);
    newCard.disruptCard();
    Card.deck.forEach((card) => {
      if (document.querySelectorAll(`[data-id="${card.id}"]`).length === 0) {
        card.renderCard2(showercase);
      }
    });
  }

  if (e.target.className === 'card__pin--down') {
    const id = Number(e.target.parentElement.dataset.id);
    const cardSelected = Card.deck.find((card) => card.id === id);
    const indexCard = Card.deck.findIndex((card) => card.id === id);
    Card.removeDeck(indexCard);
  }
});
