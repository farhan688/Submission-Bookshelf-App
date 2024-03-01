const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const MOVED_EVENT = "moved-book";
const DELETED_EVENT = "deleted-book";
const STORAGE_KEY = "LIBRARY_MANAGER";
const booksData = [];

const isStorageAvailable = () => {
  if (typeof Storage === undefined) {
    alert("Your browser does not support web storage");
    return false;
  }
  return true;
};

document.addEventListener(RENDER_EVENT, () => {
  const unreadBookContainer = document.getElementById("unreadBooksContainer");
  unreadBookContainer.innerHTML = "";

  const readBookContainer = document.getElementById("readBooksContainer");
  readBookContainer.innerHTML = "";

  for (const bookItem of booksData) {
    const bookElement = makeBookElement(bookItem);
    if (!bookItem.isComplete) {
      unreadBookContainer.appendChild(bookElement);
    } else {
      readBookContainer.appendChild(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, () => {
  displayAlert("Book Saved Successfully!");
});

document.addEventListener(MOVED_EVENT, () => {
  displayAlert("Book Moved Successfully!");
});

document.addEventListener(DELETED_EVENT, () => {
  displayAlert("Book Deleted Successfully!");
});

const displayAlert = (message) => {
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  alertElement.innerText = message;

  document.body.insertBefore(alertElement, document.body.children[0]);
  setTimeout(() => {
    alertElement.remove();
  }, 2000);
};

const loadStorageData = () => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data !== null) {
    for (const item of data) {
      booksData.push(item);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const saveData = () => {
  if (isStorageAvailable()) {
    const parsed = JSON.stringify(booksData);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const moveData = () => {
  if (isStorageAvailable()) {
    const parsed = JSON.stringify(booksData);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(MOVED_EVENT));
  }
};

const deleteData = () => {
  if (isStorageAvailable()) {
    const parsed = JSON.stringify(booksData);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(DELETED_EVENT));
  }
};

const addBook = () => {
  const bookTitle = document.getElementById("title");
  const bookAuthor = document.getElementById("author");
  const bookYear = document.getElementById("year");
  const bookIsRead = document.getElementById("isRead");

  const bookStatus = bookIsRead.checked;

  booksData.push({
    id: +new Date(),
    title: bookTitle.value,
    author: bookAuthor.value,
    year: Number(bookYear.value),
    isComplete: bookStatus,
  });

  bookTitle.value = null;
  bookAuthor.value = null;
  bookYear.value = null;
  bookIsRead.checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const makeBookElement = (bookObject) => {
  const titleElement = document.createElement("p");
  titleElement.classList.add("item-title");
  titleElement.innerHTML = `${bookObject.title} <span>(${bookObject.year})</span>`;

  const authorElement = document.createElement("p");
  authorElement.classList.add("item-writer");
  authorElement.innerText = bookObject.author;

  const descContainer = document.createElement("div");
  descContainer.classList.add("item-desc");
  descContainer.append(titleElement, authorElement);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("item-action");

  const bookContainer = document.createElement("div");
  bookContainer.classList.add("item");
  bookContainer.append(descContainer);
  bookContainer.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const returnBtn = createButton("Return", "return-btn", () => {
      returnBookFromFinished(bookObject.id);
    });

    const deleteBtn = createButton("Delete", "delete-btn", () => {
      deleteBook(bookObject.id);
    });

    actionContainer.append(returnBtn, deleteBtn);
    bookContainer.append(actionContainer);
  } else {
    const markReadBtn = createButton("Mark as Read", "mark-read-btn", () => {
      addBookToFinished(bookObject.id);
    });

    const deleteBtn = createButton("Delete", "delete-btn", () => {
      deleteBook(bookObject.id);
    });

    actionContainer.append(markReadBtn, deleteBtn);
    bookContainer.append(actionContainer);
  }

  return bookContainer;
};

const createButton = (text, className, onClick) => {
  const button = document.createElement("button");
  button.classList.add(className);
  button.innerHTML = text;
  button.addEventListener("click", onClick);
  return button;
};

const addBookToFinished = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  moveData();
};

const returnBookFromFinished = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  moveData();
};

const deleteBook = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  booksData.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  deleteData();
};

const findBook = (bookId) => {
  for (const bookItem of booksData) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
};

const findBookIndex = (bookId) => {
  for (const index in booksData) {
    if (booksData[index].id === bookId) {
      return index;
    }
  }

  return -1;
};

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageAvailable()) {
    loadStorageData();
  }

  const saveForm = document.getElementById("bookForm");
  saveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBooks();
  });

  const resetButton = document.querySelector(".reset-btn");
  resetButton.addEventListener("click", () => {
    document.getElementById("search").value = "";
    searchBooks();
  });
});

const searchBooks = () => {
  const searchInput = document.getElementById("search").value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");

  for (let i = 0; i < bookItems.length; i++) {
    const itemTitle = bookItems[i].querySelector(".item-title");
    if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
      bookItems[i].classList.remove("hidden");
    } else {
      bookItems[i].classList.add("hidden");
    }
  }
};
