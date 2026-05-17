//note for me: e.stop propagation always prevents the enitre block from triggering due to a click.
let notesArr = [
  { id: 1, title: "Add Note", language: "JavaScript", steps: [] },
  { id: 2, title: "Another Note", language: "python", steps: [] },
];

const storedNotes = localStorage.getItem("notes");
if (storedNotes) {
  notesArr = JSON.parse(storedNotes);
}

let currentNoteId = null;
if (notesArr.length > 0) {
  currentNoteId = notesArr[0].id;
}

const addNoteBtn = document.querySelector(".add-note-btn");
const noteList = document.querySelector(".note-list");
const noteTitle = document.querySelector(".note-title");
const stepTextarea = document.querySelector(".code-snippet");
const addStepBtn = document.querySelector(".add-step-btn");
const selectLanguage = document.querySelector(".select-language");
const mainPanel = document.querySelector(".main-panel");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

//my hamburger func
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("active");
  hamburgerBtn.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
  hamburgerBtn.classList.remove("active");
  document.body.style.overflow = "";
}

hamburgerBtn.addEventListener("click", () => {
  sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
});

overlay.addEventListener("click", closeSidebar);

const deleteBtn = document.querySelector(".delete-btn");
deleteBtn.addEventListener("click", () => {
  if (currentNoteId) {
    deleteNoteById({ stopPropagation: () => {} }, currentNoteId);
  }
});

const searchBar = document.querySelector(".search-bar");
searchBar.addEventListener("input", () => {
  const query = searchBar.value.toLowerCase();
  const filtered = notesArr.filter((note) =>
    note.title.toLowerCase().includes(query),
  );
  renderFilteredNotesList(filtered);
});

function showSavedIndicator() {
  const indicator = document.querySelector(".saved-indicator");
  indicator.style.opacity = "1";
  setTimeout(() => {
    indicator.style.opacity = "0";
  }, 1000);
}

function deleteNoteById(e, noteId) {
  e.stopPropagation();
  const confirmed = confirm("Are you sure you want to delete this note?");
  if (!confirmed) return;

  notesArr = notesArr.filter((note) => note.id !== noteId);

  if (notesArr.length > 0) {
    currentNoteId = notesArr[0].id;
  } else {
    currentNoteId = null;
  }

  localStorage.setItem("notes", JSON.stringify(notesArr));
  renderNotesList();
  renderMainPanel();
  showSavedIndicator();
}

function renderFilteredNotesList(arr) {
  noteList.innerHTML = "";
  arr.forEach((note) => {
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");
    noteCard.innerHTML = `
              <h3>${note.title}</h3>
              <p>Language: ${note.language}</p>
              <button class="edit-note-btn">Edit</button>
              <button class="delete-note-btn">Delete</button>
          `;
    noteList.appendChild(noteCard);
  });
}

function renderNotesList() {
  noteList.innerHTML = "";
  notesArr.forEach((note) => {
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");
    noteCard.innerHTML = `
              <h3>${note.title}</h3>
              <p>Language: ${note.language} . ${note.steps.length} ${note.steps.length !== 1 ? "steps" : "step"}</p>
              <button class="edit-note-btn">Edit</button>
              <button class="delete-note-btn">Delete</button>
          `;

    if (note.id === currentNoteId) {
      noteCard.classList.add("active");
    }

    noteCard
      .querySelector(".delete-note-btn")
      .addEventListener("click", (e) => {
        deleteNoteById(e, note.id);
      });

    noteCard.querySelector(".edit-note-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      currentNoteId = note.id;
      renderNotesList();
      renderMainPanel();
      noteTitle.focus();
    });

    noteCard.addEventListener("click", () => {
      currentNoteId = note.id;
      renderNotesList();
      renderMainPanel();
    });
    noteList.appendChild(noteCard);
  });
}

function renderMainPanel() {
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });

  if (!note) {
    noteTitle.value = "";
    noteTitle.disabled = true;
    selectLanguage.disabled = true;
    selectLanguage.value = "JavaScript";
    document.querySelector(".steps-container").innerHTML =
      "<p class='empty-msg'>No note selected. Please create or select a note.</p>";
    return;
  }
  noteTitle.disabled = false;
  selectLanguage.disabled = false;
  noteTitle.value = note.title;
  selectLanguage.value = note.language;
  renderSteps();
}

function addStep(stepText) {
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });
  note.steps.push(stepText);
  renderSteps();

  stepTextarea.value = "";
  localStorage.setItem("notes", JSON.stringify(notesArr));
  showSavedIndicator();
}

addStepBtn.addEventListener("click", () => {
  const stepText = stepTextarea.value.trim();
  if (stepText) {
    addStep(stepText);
  }
});

stepTextarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const stepText = stepTextarea.value.trim();
    if (stepText) {
      addStep(stepText);
    }
  }
});

function renderSteps() {
  document.querySelector(".steps-container").innerHTML = "";
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });
  if (!note) return;
  if (note.steps.length === 0) {
    document.querySelector(".steps-container").innerHTML =
      "<p class='empty-msg'>No steps added yet. Use the input below to add steps.</p>";
    return;
  }

  note.steps.forEach((step, index) => {
    const stepDiv = document.createElement("div");
    stepDiv.classList.add("step");
    stepDiv.innerHTML = `
        <span class="step-num">${index + 1}</span>
        <span class="step-text">${step}</span>
        <span class="delete-step-btn" data-index="${index}">Delete</span>
      `;
    document.querySelector(".steps-container").appendChild(stepDiv);

    stepDiv.querySelector(".delete-step-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      note.steps.splice(index, 1);
      renderSteps();
      localStorage.setItem("notes", JSON.stringify(notesArr));
    });
  });
}
//listening for what the usetr is typing in the note title input and updating the title in the array and local storage, then re-rendering the note list to reflect the updated title
noteTitle.addEventListener("input", (e) => {
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });

  if (!note) return;
  note.title = e.target.value;
  localStorage.setItem("notes", JSON.stringify(notesArr));
  renderNotesList();
});
noteTitle.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    noteTitle.blur();
  }
});

//listening for when the user changes the language in the dropdown selection and updating the language in the sidebar and in the array and local storage, then re-rendering the note list to reflect the updated language, yipeeeeeee!!
selectLanguage.addEventListener("change", (e) => {
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });
  if (!note) return;
  note.language = selectLanguage.value;
  localStorage.setItem("notes", JSON.stringify(notesArr));
  renderNotesList();
  showSavedIndicator();
});

//creating a new note and pushing it to the array, then rendering the note list from the array instead of directly manipulating the DOM
function createNote() {
  const newNote = {
    id: Date.now(),
    title: "New Note",
    language: "JavaScript",
    steps: [],
  };

  notesArr.push(newNote);
  localStorage.setItem("notes", JSON.stringify(notesArr));
  //update the array first and rerender the note list
  // from the array instead
  currentNoteId = newNote.id;
  renderNotesList();
  renderMainPanel();
}

addNoteBtn.addEventListener("click", createNote);

renderNotesList();
renderMainPanel();
