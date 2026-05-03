export function createCard(cardData, currentUserId, deleteCallback, likeCallback, imageCallback, infoCallback) {
  const cardTemplate = document.querySelector('#card-template').content;
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);

  // Находим элементы
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeCount = cardElement.querySelector('.card__like-count');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  // Ищем оба возможных варианта классов для корзины и лайка!
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete') || cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button') || cardElement.querySelector('.card__like');

  // 1. Отрисовка базовых данных и картинки
  if (cardImage) {
    cardImage.src = cardData.link;
    cardImage.alt = cardData.name;
    cardImage.addEventListener('click', () => {
      imageCallback(cardData);
    });
  }

  if (cardTitle) {
    cardTitle.textContent = cardData.name;
  }

  // 2. Логика лайков
  if (likeCount) {
    likeCount.textContent = cardData.likes.length;
  }

  if (likeButton) {
    const isLikedByMe = cardData.likes.some(user => user._id === currentUserId);
    if (isLikedByMe) {
      likeButton.classList.add('card__like-button_is-active');
    }
    likeButton.addEventListener('click', () => {
      likeCallback(cardData._id, likeButton, likeCount);
    });
  }

  // 3. Кнопка информации "i"
  if (infoButton) {
    infoButton.addEventListener('click', () => {
      infoCallback(cardData._id); // Вызываем колбэк из index.js
    });
  }

  // 4. Логика удаления (Корзина)
  if (deleteButton) {
    if (cardData.owner._id !== currentUserId) {
      deleteButton.remove(); // Убираем корзину, если карточка чужая
    } else {
      deleteButton.addEventListener('click', () => {
        deleteCallback(cardData._id, cardElement);
      });
    }
  }

  return cardElement;
}

export function removeCardElement(cardElement) {
  cardElement.remove();
}

export function updateLikeUI(likeButton, likeCountElement, likesCount) {
  likeButton.classList.toggle('card__like-button_is-active');
  likeCountElement.textContent = likesCount;
}