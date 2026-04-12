// getting the buttons and inputs from the page
// basically just grabbing stuff so JS can use it
const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");

const tittelInput = document.getElementById("tittelInput");
const bodyInput = document.getElementById("bodyInput");


// this grabs all notes from the backend and shows them on the page
function fetchNotes() {
  fetch("http://localhost:3000/notes")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("notesContainer");
      const emptyState = document.getElementById("emptyState");

      // if there are no notes, show the "empty" message
      // otherwise hide it
      emptyState.style.display = data.length === 0 ? "block" : "none";

      // turn each note into a little box of HTML and put it on the page
      container.innerHTML = data
        .map(
          (note) => `
        <div class="note">
          <h3>${note.Tittel}</h3>
          <p>${note.Body}</p>

          <!-- buttons for deleting and updating the note -->
          <button data-id="${note.id}" class="deleteNoteBtn">Delete</button>
          <button data-id="${note.id}" class="updateNoteBtn">Update</button>
        </div>
      `,
        )
        .join("");

      // add click events to the buttons AFTER they are created
      // (because they don't exist before we render them)
      document.querySelectorAll(".deleteNoteBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          deleteNote(btn.dataset.id);
        });
      });

      document.querySelectorAll(".updateNoteBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          updateNote(btn.dataset.id);
        });
      });
    })
    .catch((err) => console.error("something went wrong while getting notes:", err));
}


// deletes a note from backend using its id
function deleteNote(id) {
  fetch(`http://localhost:3000/notes/${id}`, {
    method: "DELETE",
  })
    .then(() => fetchNotes()) // refresh after delete so ui updates
    .catch((err) => console.error("Delete error:", err));
}


// updates a note by asking user for new values
function updateNote(id) {
  const newTittel = prompt("New tittel: ");
  const newBody = prompt("Ny tekst: ");

  // user pressed cancel so we just stop here
  if (newTittel === null || newBody === null) {
    return;
  }

  // simple validation so we dont send empty values to backend
  if (newTittel.trim() === "" || newBody.trim() === "") {
    alert("This cannot be empty");
    return;
  }

  // send updated data to backend
  fetch(`http://localhost:3000/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Tittel: newTittel,
      Body: newBody,
    }),
  })
    .then(() => fetchNotes()) // refresh list after update
    .catch((err) => console.error("Update error:", err));
}


// loads todos from backend and shows them on page
function fetchTodos() {
  fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("todosContainer");

      // convert todos into html
      container.innerHTML = data.map((todo) => `
        <div class="todo">

          <!-- if done is true we strike through text -->
          <p style="text-decoration: ${todo.Done ? "line-through" : "none"}">
            ${todo.Text}
          </p>

          <button data-id="${todo.id}" class="deleteTodoBtn">Delete</button>
          <button data-id="${todo.id}" class="toggleTodoBtn">✔</button>
        </div>
      `).join("");

      // delete todo button clicks
      document.querySelectorAll(".deleteTodoBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          deleteTodo(btn.dataset.id);
        });
      });

      // toggle done/undone button clicks
      document.querySelectorAll(".toggleTodoBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          toggleTodo(btn.dataset.id);
        });
      });
    })
    .catch(err => console.error("Fetch todos error:", err));
}


// adds a new todo
function addTodo(todoText) {
  fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Text: todoText })
  }).then(fetchTodos);
}


// deletes a todo by id
function deleteTodo(id) {
  fetch(`http://localhost:3000/todos/${id}`, {
    method: "DELETE"
  }).then(fetchTodos);
}


// toggles done status of todo
function toggleTodo(id) {
  fetch(`http://localhost:3000/todos/${id}/toggle`, {
    method: "PUT"
  }).then(fetchTodos);
}


// open modal when clicking add note button
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});


// close modal
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});


// save new note to backend
saveNoteBtn.addEventListener("click", () => {
  const tittel = tittelInput.value.trim();
  const body = bodyInput.value.trim();

  if (!tittel || !body) {
    alert("Please fill in both fields");
    return;
  }

  fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Tittel: tittel, Body: body }),
  })
    .then((res) => res.json())
    .then(() => {
      modal.classList.add("hidden");
      tittelInput.value = "";
      bodyInput.value = "";

      fetchNotes(); // refresh notes after saving
    })
    .catch((err) => console.error("Save error:", err));
});


// first thing that runs when page loads
fetchNotes();
fetchTodos();