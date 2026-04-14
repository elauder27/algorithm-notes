let notesArr = [
  { id: 1, title: "Binary Search", language: "JavaScript", steps: [] },
  { id: 2, title: "Bubble Sort", language: "python", steps: [] },
];
const storedNotes = localStorage.getItem("notes");
if (storedNotes) {
  notesArr = JSON.parse(storedNotes);
}

let currentNoteId = null;

const addNoteBtn = document.querySelector(".add-note-btn");
const noteList = document.querySelector(".note-list");
const noteTitle = document.querySelector(".note-title");
const stepTextarea = document.querySelector(".code-snippet");
const addStepBtn = document.querySelector(".add-step-btn");

function renderNotesList() {
  noteList.innerHTML = "";
  notesArr.forEach((note) => {
    const noteCard = document.createElement("div");
    noteCard.classList.add("note-card");
    noteCard.innerHTML = `
            <h3>${note.title}</h3>
            <p>Language: ${note.language}</p>
            <button class="edit-note-btn">Edit</button>
            <button class="delete-note-btn">Delete</button>
        `;

    if (note.id === currentNoteId) {
      noteCard.classList.add("active");
    }

    noteCard
      .querySelector(".delete-note-btn")
      .addEventListener("click", (e) => {
        deleteNoteById(e);
      });

    noteCard.addEventListener("click", () => {
      currentNoteId = note.id;
      renderNotesList();
      renderMainPanel();
    });
    noteList.appendChild(noteCard);
  });
}

function deleteNoteById(e) {
  e.stopPropagation(); // Prevent the click event from bubbling up to the note card
  notesArr = notesArr.filter((note) => note.id !== currentNoteId);
  if (notesArr.length > 0) {
    currentNoteId = notesArr[0].id; // Set to the first note's ID if there are still notes left
  } else {
    currentNoteId = null;
  }
  localStorage.setItem("notes", JSON.stringify(notesArr));
  renderNotesList();
  renderMainPanel();
}

function renderMainPanel() {
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });
  if (!note) return;
  noteTitle.textContent = note.title;
}

function addStep(stepText) {
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });
  note.steps.push(stepText);
  renderSteps();

  stepTextarea.value = "";
  localStorage.setItem("notes", JSON.stringify(notesArr));
}

addStepBtn.addEventListener("click", () => {
  const stepText = stepTextarea.value.trim();
  if (stepText) {
    addStep(stepText);
  }
});

function renderSteps() {
  document.querySelector(".steps-container").innerHTML = "";
  const note = notesArr.find(function (n) {
    return n.id === currentNoteId;
  });
  if (!note) return;

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

//creating a new note and pushing it to the array, then rendering the note list from the array instead of directly manipulating the DOM
function createNote() {
  const newNote = {
    id: Date.now(),
    title: "Untitled Note",
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
