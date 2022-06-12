const express = require('express');
const router = express.Router();
const scorec = require('../models/scorecard');
const fetchuser = require('../middleware/fetchuser')

//View score card
router.get('/score', fetchuser, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(401).json("This is not a student account.")
    }
    try {
        const id = req.user.id
        const card = await scorec.find({ sid: id }).select(['subname', 'score', 'comment', 'examdate'])
        res.json(card)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

module.exports = router