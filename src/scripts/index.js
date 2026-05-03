import { getUserInfo, getCardList, deleteCard, changeLikeCardStatus, updateAvatar, addCard, setUserInfo }
from './components/api.js';
import '../pages/index.css';
import { createCard, removeCardElement, updateLikeUI } from './components/card.js';
import { openModal, closeModal, setModalListeners } from './components/modal.js';
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
const logo = document.querySelector('.header__logo');

const popupEdit = document.querySelector('.popup_type_edit');
const popupNewCard = document.querySelector('.popup_type_new-card');
const popupImage = document.querySelector('.popup_type_image');
const popupAvatar = document.querySelector('.popup_type_avatar');
const popupInfo = document.querySelector('.popup_type_info');

const infoList = popupInfo.querySelector('.popup__info');
const likesList = popupInfo.querySelector('.popup__list');
const mainTitle = popupInfo.querySelector('h3.popup__title');
const subTitle = popupInfo.querySelector('h4.popup__title');

const definitionTemplate = document.querySelector('#popup-info-definition-template').content;
const badgeTemplate = document.querySelector('#popup-info-user-preview-template').content;

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

let currentUserId;

const formatDate = (date) => {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function createInfoString(term, description) {
  const element = definitionTemplate.querySelector('.popup__info-item').cloneNode(true);
  element.querySelector('.popup__info-term').textContent = term;
  element.querySelector('.popup__info-description').textContent = description;
  return element;
}

function createBadge(text) {
  const element = badgeTemplate.querySelector('.popup__list-item').cloneNode(true);
  element.textContent = text;
  return element;
}

function renderLoading(isLoading, button, buttonText = 'Сохранить', loadingText = 'Сохранение...') {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = buttonText;
  }
}

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      if (!cardData) return;

      mainTitle.textContent = 'Информация о карточке';
      subTitle.textContent = 'Лайкнули:';

      infoList.innerHTML = '';
      likesList.innerHTML = '';

      infoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      if (cardData.likes.length > 0) {
        subTitle.style.display = 'block';
        cardData.likes.forEach(user => {
          likesList.append(createBadge(user.name));
        });
      } else {
        subTitle.style.display = 'none';
      }

      openModal(popupInfo);
    })
    .catch((err) => console.log('Ошибка получения данных:', err));
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      let totalLikes = 0;
      const uniqueUsers = new Set();
      const likesCountByUser = {};

      cards.forEach((card) => {
        totalLikes += card.likes.length;
        uniqueUsers.add(card.owner._id);

        card.likes.forEach((user) => {
          uniqueUsers.add(user._id);
          if (!likesCountByUser[user._id]) {
            likesCountByUser[user._id] = { name: user.name, count: 0 };
          }
          likesCountByUser[user._id].count += 1;
        });
      });

      let maxLikesFromOne = 0;
      let champions =[];

      for (const userId in likesCountByUser) {
        const userStats = likesCountByUser[userId];
        if (userStats.count > maxLikesFromOne) {
          maxLikesFromOne = userStats.count;
          champions = [userStats.name];
        } else if (userStats.count === maxLikesFromOne && userStats.count > 0) {
          champions.push(userStats.name);
        }
      }

      const championName = maxLikesFromOne > 0 ? champions.join(', ') : 'Нет';
      const sortedCards = [...cards].sort((a, b) => b.likes.length - a.likes.length);
      const topCards = sortedCards.slice(0, 3);

      mainTitle.textContent = 'Статистика карточек';
      subTitle.textContent = 'Популярные карточки:';
      subTitle.style.display = 'block';

      infoList.innerHTML = '';
      likesList.innerHTML = '';

      infoList.append(
        createInfoString('Всего пользователей:', uniqueUsers.size),
        createInfoString('Всего лайков:', totalLikes),
        createInfoString('Максимально лайков от одного:', maxLikesFromOne),
        createInfoString('Чемпион лайков:', championName)
      );

      if (topCards.length > 0) {
        topCards.forEach(card => {
          likesList.append(createBadge(card.name));
        });
      } else {
        subTitle.style.display = 'none';
      }

      openModal(popupInfo);
    })
    .catch((err) => console.log('Ошибка при получении статистики:', err));
};

function handleImageClick(cardData) {
  popupImageImg.src = cardData.link;
  popupImageImg.alt = cardData.name;
  popupImageCaption.textContent = cardData.name;
  openModal(popupImage);
}

function handleDeleteCard(cardId, cardElement) {
  deleteCard(cardId)
    .then(() => {
      removeCardElement(cardElement);
    })
    .catch((err) => console.log(err));
}

function handleLikeCard(cardId, likeButton, likeCountElement) {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      updateLikeUI(likeButton, likeCountElement, updatedCardData.likes.length);
    })
    .catch((err) => console.log(err));
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, 'Сохранение...');

  setUserInfo({
    name: nameInput.value,
    about: jobInput.value
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(popupEdit);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(false, submitButton, initialText));
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
        handleImageClick,
        handleInfoClick
      );
      placesList.prepend(cardElement);
      closeModal(popupNewCard);
      evt.target.reset();
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(false, submitButton, initialText));
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, 'Сохранение...');

  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileImage.style.backgroundImage = `url('${userData.avatar}')`;
      closeModal(popupAvatar);
      evt.target.reset();
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(false, submitButton, initialText));
}

logo.addEventListener('click', handleLogoClick);

buttonEditProfile.addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
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
  setModalListeners(popup);
});

enableValidation(validationConfig);

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
        handleImageClick,
        handleInfoClick
      );
      placesList.append(cardElement);
    });
  })
  .catch((err) => console.log(err));