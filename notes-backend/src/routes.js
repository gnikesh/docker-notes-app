const express = require('express');
const mongoose = require('mongoose');
const { Note } = require('./models');
const noteRouter = express.Router();

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

        const note = new Note({ title, content });
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