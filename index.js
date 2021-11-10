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
  // Define a RegExp
  const reg = new RegExp(input, 'i');
  return arr.filter((term) => {
    if (term.match(reg)) {
      return term;
    }
  });
};

// const getChamp = async function (champ) {
//   try {
//     const req = await fetch(
//       `https://ddragon.leagueoflegends.com/cdn/11.21.1/data/en_US/champion/${champ}.json`
//     );
//     const res = await req.json();
//     return res.data[champ];
//   } catch (e) {
//     console.error(`MANAGED: ${e}`);
//   }
// };

// DRY principle to apply, I should generate element tag x2 plus using literal template.
// I don't know what array method to use to get values while performing a forEach or should I use another method to loop the tags array?
// const populateCard = function (champ) {
//   let tag1 = champ.tags[0];
//   let tag2;
//   let html;
//   if (champ.tags.length === 2) {
//     tag2 = champ.tags[1];
//     html = `<article class="card" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg');">
//     <div class="card__pin--up"></div>
//   <h1 class="card__name">${champ.name}</h1>
//   <h2 class="card__title">${champ.title}</h2>
//   <div class="card__tag-container">
//     <h3 class="card__tags">${tag1}</h3>
//     <h3 class="card__tags">${tag2}</h3>
//   </div>
//   <p class="card__lore">
//   ${champ.lore}
//   </p>
//   </article>`;
//   } else {
//     html = `<article class="card" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg');">
//     <div class="card__pin--up"></div>
//   <h1 class="card__name">${champ.name}</h1>
//   <h2 class="card__title">${champ.title}</h2>
//   <div class="card__tag-container">
//     <h3 class="card__tags">${tag1}</h3>
//   </div>
//   <p class="card__lore">
//   ${champ.lore}
//   </p>
//   </article>`;
//   }
//   return html;
// };

// const Card = {
//   create: async function (champ) {
//     const dataChamp = await getChamp(champ);
//     const htmlCard = populateCard(dataChamp);
//     this.renderCard(htmlCard);
//   },
//   renderCard: function (htmlToInject) {
//     if (searchResult.innerHTML !== '') searchResult.innerHTML = '';
//     searchResult.insertAdjacentHTML('afterbegin', htmlToInject);
//     const card = document.querySelector('.card');
//     // card.style.background = `linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ}_0.jpg)`;
//     card.classList.add('load');
//   },
// };

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
    let tag1 = champ.tags[0];
    let tag2;
    let html;
    if (champ.tags.length === 2) {
      tag2 = champ.tags[1];
      html = `<article class="card" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg');">
      <div class="card__pin--up"></div>
    <h1 class="card__name">${champ.name}</h1>
    <h2 class="card__title">${champ.title}</h2>
    <div class="card__tag-container">
      <h3 class="card__tags">${tag1}</h3>
      <h3 class="card__tags">${tag2}</h3>
    </div>
    <p class="card__lore">
    ${champ.lore}
    </p>
    </article>`;
    } else {
      html = `<article class="card" style="background: linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg');">
      <div class="card__pin--up"></div>
    <h1 class="card__name">${champ.name}</h1>
    <h2 class="card__title">${champ.title}</h2>
    <div class="card__tag-container">
      <h3 class="card__tags">${tag1}</h3>
    </div>
    <p class="card__lore">
    ${champ.lore}
    </p>
    </article>`;
    }
    return html;
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
    console.log(cardDeleted);

    cardDeleted[0].disruptCard2();
  };
}

// let a;
// Card.deck[0].html.then(html=>a=html);
// const b= a.split('article');
// const c = ` data-id="${this.id}" `;
// const d = b[0]+'article'+c+b[1]+'article'+b[2]

// const renderCard = function (htmlToInject) {
//   if (searchResult.innerHTML !== '') searchResult.innerHTML = '';
//   searchResult.insertAdjacentHTML('afterbegin', htmlToInject);
//   const card = document.querySelector('.card');
//   // card.style.background = `linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ}_0.jpg)`;
//   card.classList.add('load');
//   console.log(htmlToInject);
// };

// const createCard = async function (champ) {
//   const dataChamp = await getChamp(champ);
//   const htmlCard = populateCard(dataChamp);
//   renderCard(htmlCard);
// };

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
    // .renderCard(showercase);
  }

  if (e.target.className === 'card__pin--down') {
    // console.log(e.target.parentElement.dataset.id);
    const id = Number(e.target.parentElement.dataset.id);
    // console.log(id);

    const cardSelected = Card.deck.find((card) => card.id === id);
    console.log(cardSelected);

    const indexCard = Card.deck.findIndex((card) => card.id === id);
    Card.removeDeck(indexCard);
  }
});
