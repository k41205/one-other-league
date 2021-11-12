'use strict';

/* TODO:
- reorganize code in modules
- implement try-catch to manage errors and discard promise when rejected
- make unavailable search till the autocomplete function is ready
*/

// FUNCTIONS
//////////////////////////////

const autocompleteMatch = function (string, arr) {
  const input = string;
  if (input == '') {
    return [];
  }
  // Giving string array of champ names as an argument for our regex, second argument to say it has to be case insensitive
  const reg = new RegExp(input, 'i');
  return arr.filter((term) => {
    if (term.match(reg)) {
      return term;
    }
  });
};

const stringToHtmlElement = function (str) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body.firstChild;
};

class Card {
  constructor(champion) {
    this.init(champion);
  }

  static deck = [];

  // TODO: implement try-catch
  async init(champ) {
    this.champ = await this.initChamp(champ);
    this.htmlStr = this.initHtml(this.champ); //make this html a DOM element so it would be easier to manage
    this.html = stringToHtmlElement(this.htmlStr);
    // const a = new DOMParser();
    // this.html = a.parseFromString(str, 'text/html');
    // let a = document.createElement('article')
    // a.classList.add('card')
    // a.setAttribute('data-id',this.id)
  }

  async initChamp(champ) {
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

  initHtml(champ) {
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

  async getHtml() {
    return new Promise((resolve, reject) => {
      let i = 0;
      // wait that this.html has been fetched for 5 seconds ()
      const check = setInterval(() => {
        if (this.html) {
          clearInterval(check);
          resolve(this.html);
        }
        if (i === 45) {
          clearInterval(check);
          reject('error');
        }
        i++;
      }, 100);
    });
  }

  async render(dom) {
    const html = await this.getHtml();
    dom.append(html);

    if (dom === searchResult) dom.firstElementChild.classList.add('load');
  }

  async disrupt() {
    this.html.remove();
  }

  addDeck = function () {
    // this.html add class pin-down
    this.id = Date.now();
    this.html.setAttribute('data-id', this.id);
    this.html.firstElementChild.classList.remove('card__pin--up');
    this.html.firstElementChild.classList.add('card__pin--down');
    Card.deck.push(this);
  };

  removeDeck = function () {
    const index = Card.deck.indexOf(this);
    Card.deck.splice(index, 1);
    this.disrupt();
  };
}

// MAIN
//////////////////////////////

// DOM vars
const searchCollection = document.querySelector('.search__collection');
const searchInput = document.querySelector('.search__input');
const searchResult = document.querySelector('.search__result');
const showercase = document.querySelector('.showercase');

// Data vars
let champNames;
let newCard;
// const test = new Card('Ashe');
// Card.deck.push(test);
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

// Event Listener Delegator
document.addEventListener('click', (e) => {
  // e.stopImmediatePropagation();
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
        // require search__item to be unique
        if (
          document.querySelectorAll(`[data-champ=${el}]`)[0] !== searchItemHTML
        )
          searchCollection.insertAdjacentHTML('beforeend', searchItemHTML);
      });
    });
  } else {
    searchCollection.innerHTML = '';
  }

  // create new card
  if (e.target.className === 'search__item') {
    searchInput.value = e.target.innerText;
    newCard = new Card(searchInput.value);
    if (searchResult.innerHTML !== '') searchResult.innerHTML = '';
    searchResult.classList.remove('unload');
    newCard.render(searchResult);
  }

  // add card to deck
  if (e.target.className === 'card__pin--up') {
    searchResult.classList.add('unload');
    newCard.addDeck();
    Card.deck.at(-1).render(showercase);
    return;
  }

  // remove card from deck
  if (e.target.className === 'card__pin--down') {
    const id = Number(e.target.parentElement.dataset.id);
    const cardSelected = Card.deck.find((card) => card.id === id);
    cardSelected.removeDeck();
    return;
  }
});
