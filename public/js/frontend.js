// Get all important elements from the page
const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const noteModalTitle = document.getElementById("noteModalTitle");
const folderInput = document.getElementById("folderInput");
const addFolderBtn = document.getElementById("addFolderBtn");

const tittelInput = document.getElementById("tittelInput");
const bodyInput = document.getElementById("bodyInput");

const notesContainer = document.getElementById("notesContainer");
const todosContainer = document.getElementById("todosContainer");

let folders = [];
let notes = [];
let editingNoteId = null;
let editingNoteData = null;

const API_BASE = "";

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

// Shared fetch helper with basic error handling
async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // keep fallback message
    }

    throw new Error(message);
  }

  return response;
}


// ---------------- NOTES ----------------

function resetNoteModal() {
  // Clear modal state when switching between add/edit
  editingNoteId = null;
  editingNoteData = null;
  noteModalTitle.textContent = "Add Note";
  saveNoteBtn.textContent = "Save";
  tittelInput.value = "";
  bodyInput.value = "";
  tittelInput.placeholder = "Title";
  bodyInput.placeholder = "Body";
}

function openAddNoteModal() {
  // Open modal in add mode
  resetNoteModal();
  modal.classList.remove("hidden");
}

function openEditNoteModal(note) {
  // Open modal in update mode using placeholder ghost text
  editingNoteId = note.Id;
  editingNoteData = note;
  noteModalTitle.textContent = "Update Note";
  saveNoteBtn.textContent = "Update";
  tittelInput.value = "";
  bodyInput.value = "";
  tittelInput.placeholder = note.Tittel || "Title";
  bodyInput.placeholder = note.Body || "Body";
  modal.classList.remove("hidden");
}

// load notes from backend and show them on page
function fetchNotes() {
  // Load all notes from backend
  request(apiUrl("/notes"))
    .then(res => res.json())
    .then(data => {
      notes = data;

      // Render note cards
      notesContainer.innerHTML = data.map(note => `
        <div class="note">
          <h3 class="item-title">${note.Tittel}</h3>
          <p class="item-body">${note.Body}</p>

          <div class="item-actions">
            <button data-id="${note.Id}" class="deleteNoteBtn btn btn-danger">Delete</button>
            <button data-id="${note.Id}" class="updateNoteBtn btn btn-secondary">Update</button>
          </div>
        </div>
      `).join("");

      // Connect delete buttons
      document.querySelectorAll(".deleteNoteBtn").forEach(btn => {
        btn.addEventListener("click", () => deleteNote(btn.dataset.id));
      });

      // Connect update buttons
      document.querySelectorAll(".updateNoteBtn").forEach(btn => {
        btn.addEventListener("click", () => updateNote(btn.dataset.id));
      });
    })
    .catch(err => alert(err.message));
}

// delete note
function deleteNote(id) {
  request(apiUrl(`/notes/${id}`), {
    method: "DELETE"
  })
    .then(fetchNotes)
    .catch(err => alert(err.message));
}

// update note
function updateNote(id) {
  const note = notes.find((item) => String(item.Id) === String(id));

  if (!note) {
    alert("Note not found.");
    return;
  }

  openEditNoteModal(note);
}


// ---------------- TODOS ----------------

function fetchFolders() {
  // Load folder list used to group todos
  return request(apiUrl("/folders"))
    .then((res) => res.json())
    .then((data) => {
      folders = data;
    })
    .catch((err) => alert(err.message));
}

function addFolder() {
  // Create a new folder from input
  const name = folderInput.value.trim();

  if (!name) {
    alert("Please enter a folder name.");
    return;
  }

  request(apiUrl("/folders"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Name: name })
  })
    .then(() => {
      folderInput.value = "";
      return fetchFolders();
    })
    .then(fetchTodos)
    .catch((err) => alert(err.message));
}

// load todos
function fetchTodos() {
  // Load todos and render them under each folder
  request(apiUrl("/todos"))
    .then(res => res.json())
    .then(data => {
      // Build HTML for each folder block
      const groupedHtml = folders.map((folder) => {
        const folderTodos = data.filter((todo) => String(todo.FolderId) === String(folder.Id));

        return `
        <div class="todo-folder-group">
          <div class="folder-row">
            <h3 class="folder-title">${folder.Name}</h3>
            <div class="folder-add-row">
              <input class="folderTodoInput" data-folder-id="${folder.Id}" placeholder="Add todo to ${folder.Name}">
              <button class="addFolderTodoBtn btn" data-folder-id="${folder.Id}">Add Todo</button>
            </div>
          </div>

          <div class="items-grid">
            ${folderTodos.length > 0 ? folderTodos.map((todo) => `
              <div class="todo">
                <p class="item-body ${todo.Done ? "done" : ""}">${todo.Text}</p>

                <div class="item-actions">
                  <button class="deleteTodoBtn btn btn-danger" data-id="${todo.Id}">Delete</button>
                  <button class="toggleTodoBtn btn" data-id="${todo.Id}">Toggle done</button>
                </div>
              </div>
            `).join("") : '<p class="empty-text">No todos in this folder.</p>'}
          </div>
        </div>
        `;
      }).join("");

      // Keep old todos visible if they have no folder
      const uncategorizedTodos = data.filter((todo) => !todo.FolderId);
      const uncategorizedHtml = uncategorizedTodos.length
        ? `
          <div class="todo-folder-group">
            <h3 class="folder-title">Unsorted</h3>
            <div class="items-grid">
              ${uncategorizedTodos.map((todo) => `
                <div class="todo">
                  <p class="item-body ${todo.Done ? "done" : ""}">${todo.Text}</p>
                  <div class="item-actions">
                    <button class="deleteTodoBtn btn btn-danger" data-id="${todo.Id}">Delete</button>
                    <button class="toggleTodoBtn btn" data-id="${todo.Id}">Toggle done</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `
        : "";

      // Empty state when no folders/todos exist
      if (!groupedHtml && !uncategorizedHtml) {
        todosContainer.innerHTML = '<p class="empty-text">Create a folder to start adding todos.</p>';
        return;
      }

      todosContainer.innerHTML = `${groupedHtml}${uncategorizedHtml}`;

      // Connect todo action buttons
      document.querySelectorAll(".deleteTodoBtn").forEach(btn => {
        btn.addEventListener("click", () => deleteTodo(btn.dataset.id));
      });

      document.querySelectorAll(".toggleTodoBtn").forEach(btn => {
        btn.addEventListener("click", () => toggleTodo(btn.dataset.id));
      });

      // Add todo inside a specific folder
      document.querySelectorAll(".addFolderTodoBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const folderId = btn.dataset.folderId;
          const input = document.querySelector(`.folderTodoInput[data-folder-id="${folderId}"]`);
          addTodoToFolder(folderId, input?.value || "");
        });
      });

      // Enter key support in folder todo input
      document.querySelectorAll(".folderTodoInput").forEach((input) => {
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            addTodoToFolder(input.dataset.folderId, input.value);
          }
        });
      });
    })
    .catch(err => alert(err.message));
}

// add todo to a folder
function addTodoToFolder(folderId, text) {
  // Create todo linked to one folder
  const trimmedText = text.trim();

  if (!trimmedText) {
    alert("Please write a todo first.");
    return;
  }

  request(apiUrl("/todos"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Text: trimmedText, FolderId: folderId })
  })
    .then(() => {
      fetchTodos();
    })
    .catch(err => alert(err.message));
}

// delete todo
function deleteTodo(id) {
  // Remove one todo
  request(apiUrl(`/todos/${id}`), {
    method: "DELETE"
  })
    .then(fetchTodos)
    .catch(err => alert(err.message));
}

// toggle todo done/not done
function toggleTodo(id) {
  // Toggle done status for one todo
  request(apiUrl(`/todos/${id}/toggle`), {
    method: "PUT"
  })
    .then(fetchTodos)
    .catch(err => alert(err.message));
}


// ---------------- MODAL ----------------

openModalBtn.addEventListener("click", openAddNoteModal);
closeModalBtn.addEventListener("click", () => {
  // Close and reset modal
  modal.classList.add("hidden");
  resetNoteModal();
});

saveNoteBtn.addEventListener("click", () => {
  // Save a new note or update existing note
  const tittel = tittelInput.value.trim();
  const body = bodyInput.value.trim();

  const resolvedTittel = editingNoteId
    ? (tittel || editingNoteData?.Tittel || "")
    : tittel;
  const resolvedBody = editingNoteId
    ? (body || editingNoteData?.Body || "")
    : body;

  if (!resolvedTittel || !resolvedBody) {
    alert("Please fill in both title and body.");
    return;
  }

  const method = editingNoteId ? "PUT" : "POST";
  const url = editingNoteId
    ? apiUrl(`/notes/${editingNoteId}`)
    : apiUrl("/notes");

  request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Tittel: resolvedTittel, Body: resolvedBody })
  }).then(() => {
    modal.classList.add("hidden");
    resetNoteModal();
    fetchNotes();
  }).catch(err => alert(err.message));
});

addFolderBtn.addEventListener("click", addFolder);

folderInput.addEventListener("keydown", (event) => {
  // Create folder by pressing Enter
  if (event.key === "Enter") {
    addFolder();
  }
});


// first thing that runs
fetchNotes();
fetchFolders().then(fetchTodos);