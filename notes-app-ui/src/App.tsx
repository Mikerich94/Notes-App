import { useState, useEffect } from 'react';
import "./App.css"

//Define the properties the notes will have and their types (TypeScript)
type Note = {
  id: number;
  title: string;
  content: string;
}

const App = () => {
  const [notes, setNotes] = useState
    <Note[]> 
    ([])

  // Adding state values for both form inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  //Store clicked note as selectedNote, default is null because start with no note selected
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  //Async function that calls the API
  useEffect(() => {
    const fetchNotes = async () => {
      try { //logic to call the API
       const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/notes`)  //batch function to call API, default is GET request

        //Take response and convert to json
        const notes: Note[] = await response.json() //Endpoints will give us array of Note depending on action we do
        //GET will get an array of notes from our back end
        //We need to assign it to a variable "notes", give it Note array, convert to JSON for us
        setNotes(notes) //update the state with all the notes we got from the API. Call setNotes, pass in notes

      } catch (e) { //prevents app from breaking if API request has error 
        console.log(e); //log any errors 
      } finally {
      setLoading(false); // hides warning message whether fetch succeeds or fails
    }
    };

    //call fetchNotes function 
    fetchNotes();

    // Fallback: hide warning after 60 seconds no matter what
  const timer = setTimeout(() => setLoading(false), 60000);
  return () => clearTimeout(timer); // cleanup on unmount
  }, []); //add dependency array with comma and empty array. Only runs the first time the app renders

  // Function to handle event when user clicks the note
  const handleNoteClick = (note: Note) => {  //accepts note the user clicks as param
    setSelectedNote(note); //save the clicked note using the setSelectedNote function
    setTitle(note.title); //set the title content to whatever values come from selected note
    setContent(note.content); //set the updated content 
  }

  //Function to handle the submit of the form
  const handleAddNote = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    //API call to add note to database
    try { 
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/notes`, //Since we are now making an API request, add the name async to the function 
        {
          method: "POST", //add HTTP method for creating note
          headers: {
            "Content-Type": "application/json" //specify content type as JSON since we are sending JSON data in the body of the request
          },
          body: JSON.stringify({ title, content }), //Pass in title and content from form as body of request user entered. 
          // Convert to string with JSON.stringify
        }
      );
      const newNote: Note = await response.json(); //Get the newly created note from the API response

      //moved the state function calls inside bc we need after API has completed the request
      setNotes([newNote, ...notes]); //Updates state. First item in new array is the newly created note, then it adds the rest of the existing notes with spread operator
      setTitle(""); //Resets the title after submission to be blank for better UX 
      setContent(""); //Resets the content to be blank for better UX 
    } catch (e) {
      console.log(e); //log any errors
    }
  };

  //Take whatever user changes in the clicked note and save it
  const handleUpdateNote = async (event: React.FormEvent
    ) => {
      event.preventDefault();

      // if we don't have a selected note, then just return out of the function.
      if (!selectedNote) {
        return;
      }

      try {
      //Logic to call the API to update the note in the database
       const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/notes/${selectedNote.id}`, //pass in the ID of the selected note in the URL to know which note to update
        {  //using template string to dynamically pass in the ID of the selected note ${selectedNote.id}
          method: "PUT", //HTTP method for updating note
          headers: {
            "Content-Type": "application/json" //specify content type as JSON since we are sending JSON data in the body of the request
          },
          body: JSON.stringify({ title, content }) //Pass in title and content from form as body of request user entered. 
        }
       );

       const updatedNote: Note = await response.json(); //Get the updated note from the API response

      //pasted existing code that updates the UI and paste within the try block 
      //Use notes.map function to create a new array+ update that array with our new note object
      const updatedNotesList = notes.map((note) => //.map() function iterates over the array of notes
        note.id === selectedNote.id //check to see if the ID of the note the map function is on equals the id of the selected note
          ? updatedNote //if the IDs match, return the updatedNote into the array
          : note //if the IDs don't match, return the current note
      )

      setNotes(updatedNotesList) //updates our state
      setTitle("") //Resets title variable to be a blank string
      setContent("") //same with content
      setSelectedNote(null) //reset the selectedNote after we update the array

      } catch (error) {
        console.log(error); //log any errors
      }
    };

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setSelectedNote(null);
  };

  const deleteNote = async ( //takes event and noteID to know which to delete
    event: React.MouseEvent,
    noteId: number
  ) => {
    event.stopPropagation(); //stops delete event note from interfering with other events added to the note 

    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/notes/${noteId}`, //pass in the ID of the selected note in the URL to know which note to delete
        {
          method: "DELETE" //HTTP method for deleting note
        }
      );

      const updatedNotes = notes.filter( //returns all the notes the user didn't click delete on
        (note) => note.id !== noteId
      )

      setNotes(updatedNotes); //save the new array without the deleted note to state 

    } catch (error) {
      console.log(error); //log any errors
    } 
  };

  return (
    <div>
    <div className="app-container">
      <form
  className="note-form"
  onSubmit={(event) =>
    selectedNote
      ? handleUpdateNote(event)
      : handleAddNote(event)
  }
>
  {/* Dynamic Title */}
  <h1>{selectedNote ? "Edit Note" : "Add New Note"}</h1>

  <input
    value={title}
    onChange={(event) => setTitle(event.target.value)}
    placeholder="Title"
    required
  />
  <textarea
    value={content}
    onChange={(event) => setContent(event.target.value)}
    placeholder="Content"
    rows={10}
    required
  />

  {selectedNote ? (
    <div className="edit-buttons">
      <button type="submit">Save</button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  ) : (
    <button type="submit">Add Note</button>
  )}
</form>

      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note-item"
            onClick={() => handleNoteClick(note)}>
            <div className="notes-header">
              <button
                onClick={(event) =>
                  deleteNote(event, note.id)
                }
              >x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  {loading && (
  <div className='sidenote'>
    <p>Note - the cards may take a minute to load due to the free tier subscription.</p>
  </div>
)}
  </div>
  
  )
};

export default App;