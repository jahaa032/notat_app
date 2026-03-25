const notesContainer = document.getElementById('notesContainer');
const addNoteBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput'); // make sure HTML input id is searchInput

// Fetch all notes
function fetchNotes() {
  fetch('http://localhost:3000/notes')
    .then(res => res.json())
    .then(notes => {
      // Show empty state if no notes
      const emptyState = document.getElementById('emptyState');
      emptyState.style.display = notes.length === 0 ? 'block' : 'none';

      // Render notes
      notesContainer.innerHTML = notes.map(n => `
        <div class="note">
          <h4>${n.Tittel}</h4>
          <p>${n.Body}</p>
        </div>
      `).join('');
    });
}

// Add a note
addNoteBtn.addEventListener('click', () => {
  const tittel = prompt('Tittel:');
  const body = prompt('Body:');
  if (!tittel || !body) return;

  fetch('http://localhost:3000/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Tittel: tittel, Body: body })
  }).then(() => fetchNotes());
});

// Initial load
fetchNotes();