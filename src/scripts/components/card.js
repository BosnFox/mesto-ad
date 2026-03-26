export function createCard(cardData, currentUserId, deleteCallback, likeCallback, openImageCallback) {
  const cardTemplate = document.querySelector('#card-template').content;
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  likeCount.textContent = cardData.likes.length;

  const isLikedByMe = cardData.likes.some(user => user._id === currentUserId);
  if (isLikedByMe) {
    likeButton.classList.add('card__like-button_is-active'); // Используйте ваш класс активного лайка
  }

  likeButton.addEventListener('click', () => {
    likeCallback(cardData._id, likeButton, likeCount);
  });

  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => {
      deleteCallback(cardData._id, cardElement);
    });
  }

  cardImage.addEventListener('click', () => {
    openImageCallback(cardData.name, cardData.link);
  });

  return cardElement;
}

export function deleteCard(cardElement) {
  cardElement.remove();
}

export function likeCard(evt) {
  evt.target.classList.toggle('card__like-button_is-active');
}