import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disabledButton,
} from "../scripts/validation.js";
import Api from "../utils/api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "3b2e2121-8c57-411a-855f-0d4b0fcfc9ae",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
    // document.getElementById("user-name").textContent = user.name;
    // document.getElementById("user-about").textContent = user.about;
    // document.getElementById("user-avatar").src = user.avatar;

    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    profileAvatar.src = user.avatar;
  })
  .catch(console.error);

// Profile elements
const profileModalOpenButton = document.querySelector(".profile__edit-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.getElementById("user-avatar");

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
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarImage = document.getElementById("user-avatar");

//Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form-delete");
const deleteFormCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteFormCancelBtn = deleteModal.querySelector(".modal__btn_cancel");

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

let selectedCard;
let selectedCardId;

//Functions

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");

  const cardImageEl = cardElement.querySelector(".card__image");

  const cardLikeBtn = cardElement.querySelector(".card__like-btn");

  const deleteButton = cardElement.querySelector(".card__delete-btn");

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  function handleLike(evt, id) {
    const isLiked = cardLikeBtn.classList.contains("card__like-btn_liked");
    api
      .changeLikeStatus(data._id, isLiked)
      .then((res) => {
        cardLikeBtn.classList.toggle("card__like-btn_liked", res.isLiked);
      })
      .catch(console.error);
  }

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  deleteButton.addEventListener("click", (evt) => {
    handleDeleteCard(cardElement, data);
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

  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";

  const inputValue = { name: cardNameInput.value, link: cardLinkInput.value };
  api
    .addNewCard(inputValue)
    .then((res) => {
      renderCard(res);
      closeModal(cardModal);
      evt.target.reset();
      disabledButton(cardSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      avatarImage.src = data.avatar;
      closeModal(avatarModal);
      evt.target.reset();
      disabledButton(submitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  submitBtn.textContent = "Deleting...";

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Delete";
    });
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

//EventListeners

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

deleteFormCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteFormCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleCardFormSubmit);
avatarFormElement.addEventListener("submit", handleAvatarFormSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

enableValidation(settings);
