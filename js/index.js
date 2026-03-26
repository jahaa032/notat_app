const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");

const tittelInput = document.getElementById("tittelInput");
const bodyInput = document.getElementById("bodyInput");

function fetchNotes() {
  fetch("http://localhost:3000/notes")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("notesContainer");
      const emptyState = document.getElementById("emptyState");

      emptyState.style.display = data.length === 0 ? "block" : "none";

      container.innerHTML = data
        .map(
          (note) => `
        <div class="note">
          <h3>${note.Tittel}</h3>
          <p>${note.Body}</p>

          <button data-id="${note.id}" class="deleteBtn">Delete</button>
        </div>
      `,
        )
        .join("");
    });
}

function deleteNote(id) {
  fetch(`http://localhost:3000/notes/${id}`, {
    method: "DELETE",
  }).then(() => fetchNotes());
}

// Open Model
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

//Close Model
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveNoteBtn.addEventListener("click", () => {
  const tittel = tittelInput.value;
  const body = bodyInput.value;

  if (!tittel || !body) {
    alert("Please fill in both fields");
    return;
  }

  fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Tittel: tittel, Body: body }),
  }).then(() => {
    modal.classList.add("hidden");
    tittelInput.value = "";
    bodyInput.value = "";
  });
});

fetchNotes();
