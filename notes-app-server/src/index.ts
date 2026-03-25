import { config } from "dotenv";
config({ override: true });

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/api/notes", async (req, res) => {
    const notes = await prisma.note.findMany();
    res.json(notes);
})

app.post("/api/notes", async (req, res) => { //pass in the URL we want the endpoint to be on
    const { title, content } = req.body; //get the title + content from the request body

    if (!title || !content) {
        return res
            .status(400)
            .send("title and content fields required")
    }

    //Catch any errors the Prisma client throws
    try { 
        const note = await prisma.note.create({ //call the Prisma client we create
            data: { title, content } //create function from the Note model to create new note, passing in title + content
        });
        res.json(note); //return this as json back in the response
        } catch (error) { //Send message and 500 error back if and error 
            res.status(500)
            .send("Oops something went wrong")
        }
})

app.put("/api/notes/:id", async (req, res) => { //pass in URL of put input, but with ID placeholder for edited note
    const {title, content} = req.body; //capture the title + content get from request body
    const id = parseInt(req.params.id); //get the ID from the query params. Convert to Int bc IDs are stored as integers in DB


    //Validation for empty title or content field
    if(!title || !content) {
        return res
        .status(400)
        .send("title and content fields required")
    }

    //Validation for ID 
    if(!id || isNaN(id)) { //id Id is missing or is not a number, then return 500 response
        return res
        .status(500)
        .send("ID must be a valid number")
    }
    
    try {
        const updatedNote = //update function from the Note object to upate Note for given ID 
            await prisma.note.update({
                where: { id }, //Where clause in SQL to pass in the ID to update not efor given ID
                data: { title, content } //pass in data we want to save title/content from req body
            })
            res.json(updatedNote) //return the updated note in response
    } catch (error) {
        res.status(500)
         .send("oops, something went wrong")
    }
})


app.delete("/api/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);

        if(!id || isNaN(id)) { //id Id is missing or is not a number, then return 400 response
        return res
        .status(400)
        .send("ID must be a valid integer")
    }

    //Now we have a valid ID, 
    try {
        await prisma.note.delete({ //delete function on prisma client to delete note where id = id we received from query param
            where: {id}
        });
        res.status(204).send(); //204 means no con, tells UI or consumers of API that delete was successful
    } catch (error) {
        res
        .status(500)
        .send("Oops, something went wrong");

    }
})

app.listen(5000, () => {
    console.log("server running on localhost:5000")
})