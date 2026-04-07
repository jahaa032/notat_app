const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveNoteBtn = document.getElementById("saveNoteBtn");

const tittelInput = document.getElementById("tittelInput");
const bodyInput = document.getElementById("bodyInput");

// Fetch and display notes
function fetchNotes() {
  fetch("http://localhost:3000/notes")
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("notesContainer");
      const emptyState = document.getElementById("emptyState");

      // Show/hide empty state
      emptyState.style.display = data.length === 0 ? "block" : "none";

      // Render notes
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

      // 🔥 IMPORTANT: Add delete listeners AFTER rendering
      document.querySelectorAll(".deleteBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          deleteNote(btn.dataset.id);
        });
      });
    })
    .catch((err) => console.error("Fetch error:", err));
}

// Delete note
function deleteNote(id) {
  fetch(`http://localhost:3000/notes/${id}`, {
    method: "DELETE",
  })
    .then(() => fetchNotes())
    .catch((err) => console.error("Delete error:", err));
}

// Open modal
openModalBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// Close modal
closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Save note
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
    .then((data) => {
      console.log("Saved:", data);

      // Reset UI
      modal.classList.add("hidden");
      tittelInput.value = "";
      bodyInput.value = "";

      // 🔥 THIS FIXES YOUR MAIN ISSUE
      fetchNotes();
    })
    .catch((err) => console.error("Save error:", err));
});

// Initial load
fetchNotes();
