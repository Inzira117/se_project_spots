import "./index.css";
import {enableValidation, settings, resetValidation, showInputError, disabledButton} from "../scripts/validation.js";
import Api from "../utils/api.js";

// const initialCards = [
//   {
//     name: "Golden Gate bridge",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
//   },

//   {
//     name: "Val Thorens",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
//   },

//   {
//     name: "Restaurant terrace",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
//   },

//   {
//     name: "An outdoor cafe",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
//   },

//   {
//     name: "A very long bridge, over the forest and through the trees",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
//   },

//   {
//     name: "Tunnel with morning light",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
//   },

//   {
//     name: "Mountain house",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
// ];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "08432b6e-f3d8-4db4-affe-694e15f2b38a",
    "Content-Type": "application/json"
  }
});

api
.getAppInfo()
.then(([cards, user]) => {
  cards.forEach((item) => {
    renderCard(item, "append");
  });
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-about').textContent = user.about;
  document.getElementById('user-avatar').src = user.avatar;
})
//destructure the second item in the callback of the .then()
//handle the users info
//set the src of the avatar image, set the textContent of both text elements
.catch(console.error);


// Profile elements
const profileModalOpenButton = document.querySelector(".profile__edit-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Edit form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardModalOpenButton = document.querySelector(".profile__add-btn");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardNameInput = cardModal.querySelector("#add-card-name-input");

// Avatar form elements
const avatarModalOpenButton = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormElement = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-edit-avatar-input");


// Previev image elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previevCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// Card related elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
const cardFormElement = cardModal.querySelector(".modal__form");

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");

  const cardImageEl = cardElement.querySelector(".card__image");

  const cardLikeBtn = cardElement.querySelector(".card__like-btn");

  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardLikeBtn.addEventListener("click", () => {
    cardLikeBtn.classList.toggle("card__like-btn_liked");
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  cardDeleteBtn.addEventListener("click", () => {
    cardElement.remove();
  });

  cardNameEl.textContent = data.name;

  cardImageEl.src = data.link;

  cardImageEl.alt = data.name;

  return cardElement;
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", closeModalEsc);
  modal.removeEventListener("mousedown", closeOverlay);
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", closeModalEsc);
  modal.addEventListener("mousedown", closeOverlay);
}

function closeOverlay(e) {
  if (e.target.classList.contains("modal")) {
    closeModal(e.target);
  }
}

function closeModalEsc(e) {
  if (e.key === "Escape") {
    const modalOpened = document.querySelector(".modal_opened");
    closeModal(modalOpened);
  }
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  api 
  .editUserInfo({name:editModalNameInput.value, about:editModalDescriptionInput.value})
  .then((data) => {
    // TODO Use data el instead of input values
    profileName.textContent = data.name;
    profileDescription.textContent = data.about;
    closeModal(editModal);
  })
  .catch(console.error);
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const inputValue = { name: cardNameInput.value, link: cardLinkInput.value };
  renderCard(inputValue);
  closeModal(cardModal);
  evt.target.reset();
  disabledButton(avatarSubmitBtn, settings);
}


function handleAvatarFormSubmit(evt) {
  evt.preventDefault();

  api
  .editAvatarInfo(avatarInput.value)
  .then((data) => {
    const avatarImage = document.getElementById('profile-edit-avatar-input'); // Ensure this ID matches your HTML
    avatarImage.src = data.avatar; 
    closeModal(avatarModal); 
    evt.target.reset();
    disabledButton(avatarSubmitBtn, settings);
  })
  .catch(console.error);
}

profileModalOpenButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editModal,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalOpenButton.addEventListener("click", () => {
  openModal(cardModal);
});


cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

previevCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

avatarModalOpenButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});



editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleCardFormSubmit);
avatarFormElement.addEventListener("submit", handleAvatarFormSubmit);


function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

enableValidation(settings);



