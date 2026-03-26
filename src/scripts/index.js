import { getUserInfo, getCardList, deleteCard, changeLikeCardStatus, updateAvatar, addCard } from './components/api.js';
import '../pages/index.css';
import { createCard, deleteCard, likeCard } from './components/card.js';
import { openModal, closeModal } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

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
const profileImage = document.querySelector('.profile__image');
const buttonEditProfile = document.querySelector('.profile__edit-button');
const buttonAddCard = document.querySelector('.profile__add-button');

const formEditProfile = document.forms['edit-profile'];
const nameInput = formEditProfile.elements.name;
const jobInput = formEditProfile.elements.description;

const formNewCard = document.forms['new-place'];
const cardNameInput = formNewCard.elements['place-name'];
const cardLinkInput = formNewCard.elements.link;

const formAvatar = document.forms['edit-avatar'];
const avatarInput = formAvatar.elements.avatar;

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
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, 'Сохранение...');

  setUserInfo({
    name: profileNameInput.value,
    about: profileDescriptionInput.value
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(profilePopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, 'Создание...');

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then((cardData) => {
      const cardElement = createCard(
        cardData,
        currentUserId,
        handleDeleteCard,
        handleLikeCard,
        handleImageOpen
      );

      placesList.prepend(cardElement);

      closeModal(newCardPopup);
      evt.target.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, 'Сохранение...');

  updateAvatar(avatarLinkInput.value)
    .then((userData) => {
      profileImage.style.backgroundImage = `url('${userData.avatar}')`;
      closeModal(avatarPopup);
      evt.target.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
}

function handleDeleteCard(cardId, cardElement) {
  deleteCard(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleLikeCard(cardId, likeButton, likeCountElement) {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      likeButton.classList.toggle('card__like-button_is-active');
      likeCountElement.textContent = updatedCardData.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
}

function renderLoading(isLoading, button, buttonText = 'Сохранить', loadingText = 'Сохранение...') {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = buttonText;
  }
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

const popups = document.querySelectorAll('.popup');
popups.forEach((popup) => {
  popup.addEventListener('mousedown', (evt) => {
    if (evt.target.classList.contains('popup_is-opened')) {
      closeModal(popup);
    }
    if (evt.target.classList.contains('popup__close')) {
      closeModal(popup);
    }
  });
});

enableValidation(validationConfig);

let currentUserId;

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;

    profileImage.style.backgroundImage = `url('${userData.avatar}')`;

    cards.forEach((cardData) => {
      const cardElement = createCard(
        cardData,
        currentUserId,
        handleDeleteCard,
        handleLikeCard,
        handleImageClick
      );

      placesList.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });