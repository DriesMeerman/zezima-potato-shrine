import { readState, saveState, harvestPotato, addEntry, MAX_POTATOES } from './state.js';

let storage;
try { storage = window.localStorage; } catch { storage = null; }
let state = readState(storage);
let picked = 0;
const count = document.querySelector('#harvest-count');
const farm = document.querySelector('#farm');
const harvestStatus = document.querySelector('#harvest-status');
const guestStatus = document.querySelector('#guestbook-status');
const entryList = document.querySelector('#guestbook-entries');
const message = document.querySelector('#visitor-message');
const form = document.querySelector('#guestbook-form');
const plantButton = document.querySelector('#plant-row');

function renderCount() {
  count.textContent = state.potatoes.toLocaleString();
}

function plantRow() {
  picked = 0;
  farm.replaceChildren();
  for (let plot = 1; plot <= 6; plot += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Harvest potato ${plot}`);
    const potato = document.createElement('img');
    potato.src = 'assets/potato.svg';
    potato.alt = '';
    button.append(potato);
    button.addEventListener('click', () => {
      if (button.disabled) return;
      button.disabled = true;
      button.setAttribute('aria-label', `Potato ${plot} harvested`);
      picked += 1;
      state = harvestPotato(state);
      const saved = saveState(storage, state);
      renderCount();
      const feedback = state.potatoes === MAX_POTATOES
        ? 'The barn is full. 999,999 spuds is quite enough!'
        : picked === 6
          ? 'A fine harvest! Plant another row to keep digging.'
          : `${picked} of 6 spuds harvested. Nice digging.`;
      harvestStatus.textContent = feedback + (saved ? '' : ' Count kept for this visit only.');
      plantButton.disabled = picked < 6;
    });
    farm.append(button);
  }
  plantButton.disabled = true;
  farm.setAttribute('aria-label', 'Six potatoes ready to harvest');
}

function renderEntries() {
  entryList.replaceChildren();
  if (!state.entries.length) {
    const note = document.createElement('p');
    note.className = 'guestbook-empty';
    note.textContent = 'A fresh page. Your first note goes here.';
    entryList.append(note);
    return;
  }
  for (const entry of state.entries) {
    const article = document.createElement('article');
    article.className = 'guest-entry';
    const heading = document.createElement('div');
    heading.className = 'guest-entry-heading';
    const name = document.createElement('strong');
    name.textContent = entry.name;
    const date = document.createElement('time');
    date.dateTime = entry.date;
    date.textContent = new Date(entry.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    heading.append(name, date);
    const text = document.createElement('p');
    text.textContent = entry.message;
    article.append(heading, text);
    entryList.append(article);
  }
}

plantButton.addEventListener('click', () => {
  if (picked < 6) return;
  plantRow();
  harvestStatus.textContent = 'Another row, another six spuds. Happy digging.';
  farm.querySelector('button').focus();
});

message.addEventListener('input', () => {
  document.querySelector('#message-count').textContent = `${message.value.length} / 240`;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#visitor-name');
  const nextState = addEntry(state, name.value, message.value);
  if (!nextState) {
    guestStatus.textContent = 'Add a name and a note before signing.';
    (name.value.trim() ? message : name).focus();
    return;
  }
  state = nextState;
  const saved = saveState(storage, state);
  renderEntries();
  form.reset();
  document.querySelector('#message-count').textContent = '0 / 240';
  guestStatus.textContent = saved
    ? 'Signed! Your note is saved in this browser. The latest 12 notes are kept.'
    : 'Signed for this visit. Browser storage is unavailable, so this note will disappear when you leave.';
});

renderCount();
renderEntries();
plantRow();
if (!saveState(storage, state)) {
  harvestStatus.textContent = 'Browser storage is unavailable. Your harvest will last for this visit.';
  guestStatus.textContent = 'Browser storage is unavailable. Notes will last for this visit.';
}

const navLinks = document.querySelectorAll('.navigation a');
navLinks.forEach(link => link.addEventListener('click', () => {
  navLinks.forEach(item => item.classList.remove('active'));
  link.classList.add('active');
}));
