const express = require('express');
const router = express.Router();
const user = require('../models/user');
const scorec = require('../models/scorecard');
const fetchuser = require('../middleware/fetchuser')

//List all students
router.get('/fetchallstudents', fetchuser, async (req, res) => {
    if (req.user.role === 'student') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        const mysort = { name: 1 }
        const data = await user.find({ role: "student" }).select(['name', 'email']).sort(mysort)
        res.json(data)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//Create score card
router.post('/student/:studentid', fetchuser, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let User = await user.findById(req.params.studentid)
        if (!User) { return res.status(404).send("Student not found") }
        if (User.role !== "student") { return res.status(400).send("This is not a student id!!") }
        const { subname, score, comment, examdate } = req.body
        let card = await scorec.find({ sid: req.params.studentid }).select('subname')
        for(let i=0; i<card.length; i++){
            if(card[i].subname===subname){return res.status(400).json({ errors: 'scorecard already exists' });}
        }
        const scard = await scorec.create({
            sid: req.params.studentid,
            subname,
            score,
            comment,
            examdate
        })
        res.json({ id: scard.id, message: "Scorecard added" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//Get student ranking
router.get('/getrank', fetchuser, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let rank = []
        const data = await user.find({ role: "student" }).select(['id', 'name'])
        for (let i = 0; i < data.length; i++) {
            let tscore = 0;
            const card = await scorec.find({ sid: data[i].id }).select('score')
            card.forEach((c) => {
                tscore += c.score
            })
            const percent = tscore / card.length
            rank.push({ name: `${data[i].name}`, percentage: percent })
        }
        rank.sort((a, b) => {
            return b.percentage - a.percentage
        });
        res.json(rank)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

module.exports = router