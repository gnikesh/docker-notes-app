const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const { Note } = require('./models');

const noteRouter = express.Router();
const notebooksApiUrl = process.env.NOTBOOKS_API_URL;

const validateId = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Note not found." });
    }

    next();
};

const errorHandling = (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
}

noteRouter.post('/', async (req, res, next) => {
    try {
        const { title, content, notebookId } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "'title', 'content' fields are required" });
        }
        
        let validatedNotebookId = null;

        if (!notebookId) {
            console.info({
                message: "Notebook id not provided. Storing note without notebook association.",
            });
        } else if (!mongoose.Types.ObjectId.isValid(notebookId)) {
            return res.status(400).json({ error: "Notebook not found.", notebookId });
        } else {
            try {
                await axios.get(`${notebooksApiUrl}/${notebookId}`);    
                validatedNotebookId = notebookId;

            } catch (err) {
                const jsonError = err.toJSON();
                if (jsonError.status === 404) {
                    return res.status(400).json({ error: "Notebook not found.", notebookId });
                } else {
                    console.error({
                        message: "Error verifying the Notebook ID. Upstream Notebooks service not available. Storing note with provided id for later verification.", notebookId, 
                        error: err.message,
                    });
                    // post something in a queue for later processing.
                }
            } finally {
                validatedNotebookId = notebookId;
            }
        }

        const note = new Note({ title, content, notebookId: validatedNotebookId });
        await note.save();
        res.status(201).json( {data: note} );
        
    } catch (err) {
        next(err);
    }
});


noteRouter.get('/', async (_req, res, next) => {
    try {
        const notes = await Note.find();
        return res.status(200).json({ data: notes });
    } catch (err) {
        next(err);
    }
});


noteRouter.get('/:id', validateId, async (req, res, next) => {
    try {
        
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: "Note not found " });
        }
        return res.status(200).json({ data: note });
    } catch (err) {
        next(err);
    }
});

noteRouter.put('/:id', validateId, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        )

        if (!note) {
            return res.status(404).json({ error: "Note not found." });
        }

        return res.status(200).json({ data: note });

    } catch (err) {
        next(err);
    }
});

noteRouter.delete('/:id', validateId, async (req, res, next) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);

        if (!note) {
            return res.status(404).json({ error: "Note not found." });
        }

        return res.sendStatus(204);

    } catch (err) {
        next(err);
    }
});


noteRouter.use(errorHandling);

module.exports = {
    noteRouter,
}