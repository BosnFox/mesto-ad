export function createCard(cardData, deleteCallback, likeCallback, imageCallback) {
  const cardTemplate = document.querySelector('#card-template').content;
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');

  cardTitle.textContent = cardData.name;
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;

  deleteButton.addEventListener('click', () => deleteCallback(cardElement));
  likeButton.addEventListener('click', likeCallback);
  cardImage.addEventListener('click', () => imageCallback(cardData));

  return cardElement;
}

export function deleteCard(cardElement) {
  cardElement.remove();
}

export function likeCard(evt) {
  evt.target.classList.toggle('card__like-button_is-active');
}