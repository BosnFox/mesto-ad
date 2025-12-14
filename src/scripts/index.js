import '../pages/index.css';
import { createCard, deleteCard, likeCard } from './components/card.js';
import { openModal, closeModal } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import { initialCards } from './cards.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const placesList = document.querySelector('.places__list');

const popupEdit = document.querySelector('.popup_type_edit');
const popupNewCard = document.querySelector('.popup_type_new-card');
const popupImage = document.querySelector('.popup_type_image');
const popupAvatar = document.querySelector('.popup_type_avatar');

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image'); // Container for avatar click
const buttonEditProfile = document.querySelector('.profile__edit-button');
const buttonAddCard = document.querySelector('.profile__add-button');

const formEditProfile = document.forms['edit-profile'];
const nameInput = formEditProfile.elements.name;
const jobInput = formEditProfile.elements.description;

const formNewCard = document.forms['new-place'];
const cardNameInput = formNewCard.elements['place-name'];
const cardLinkInput = formNewCard.elements.link;

const formAvatar = document.forms['edit-avatar'];

const popupImageImg = popupImage.querySelector('.popup__image');
const popupImageCaption = popupImage.querySelector('.popup__caption');

function handleImageClick(cardData) {
  popupImageImg.src = cardData.link;
  popupImageImg.alt = cardData.name;
  popupImageCaption.textContent = cardData.name;
  openModal(popupImage);
}

function renderCard(item, method = 'prepend') {
  const cardElement = createCard(item, deleteCard, likeCard, handleImageClick);
  if (method === 'prepend') {
    placesList.prepend(cardElement);
  } else {
    placesList.append(cardElement);
  }
}

function fillProfileInputs() {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  profileTitle.textContent = nameInput.value;
  profileDescription.textContent = jobInput.value;
  closeModal(popupEdit);
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const newCardData = {
    name: cardNameInput.value,
    link: cardLinkInput.value
  };
  renderCard(newCardData, 'prepend');
  closeModal(popupNewCard);
  formNewCard.reset();
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  closeModal(popupAvatar);
  formAvatar.reset();
}

buttonEditProfile.addEventListener('click', () => {
  fillProfileInputs();
  clearValidation(formEditProfile, validationConfig);
  openModal(popupEdit);
});

buttonAddCard.addEventListener('click', () => {
  formNewCard.reset();
  clearValidation(formNewCard, validationConfig);
  openModal(popupNewCard);
});

profileImage.addEventListener('click', () => {
  formAvatar.reset();
  clearValidation(formAvatar, validationConfig);
  openModal(popupAvatar);
});

formEditProfile.addEventListener('submit', handleProfileFormSubmit);
formNewCard.addEventListener('submit', handleCardFormSubmit);
formAvatar.addEventListener('submit', handleAvatarFormSubmit);

document.querySelectorAll('.popup').forEach((popup) => {
  popup.addEventListener('mousedown', (evt) => {
    if (evt.target.classList.contains('popup_is-opened')) {
      closeModal(popup);
    }
    if (evt.target.classList.contains('popup__close')) {
      closeModal(popup);
    }
  });
});

initialCards.forEach((item) => {
  renderCard(item, 'append');
});

enableValidation(validationConfig);