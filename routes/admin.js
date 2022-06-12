const express = require('express');
const router = express.Router();
const user = require('../models/user');
const classes = require('../models/classes');
const scorec = require('../models/scorecard');
const fetchuser = require('../middleware/fetchuser')

//List all teachers
router.get('/fetchallteachers', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        const mysort = { name: 1 }
        const data = await user.find({ role: "teacher" }).select(['name', 'email']).sort(mysort)
        res.json(data)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

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

//add teacher
router.post('/teacher', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    const { name, email, password } = req.body
    try {
        let User = await user.findOne({ email: email })
        if (User) {
            return res.status(400).json({ errors: 'A teacher with same email exists so please choose another one' });
        }
        User = await user.create({
            name,
            email,
            password,
            role: "teacher"
        })
        res.json({ id: User.id, message: "Teacher added" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//add student
router.post('/student', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    const { name, email, password } = req.body
    try {
        let User = await user.findOne({ email: email })
        if (User) {
            return res.status(400).json({ errors: 'A student with same email exists so please choose another one' });
        }
        User = await user.create({
            name,
            email,
            password,
            role: "student"
        })
        res.json({ id: User.id, message: "Student added" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//add class
router.post('/class', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    const { classname } = req.body
    try {
        let Class = await classes.findOne({ name: classname })
        if (Class) {
            return res.status(400).json({ errors: 'A class with same name exists so please choose another one' });
        }
        Class = await classes.create({
            name: classname
        })
        res.json({ id: Class.id, message: "Class added" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//remove class
router.delete('/class/:classid', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let Class = await classes.findById(req.params.classid)
        if (!Class) { return res.status(404).send("Class not found") }
        const id = Class.id
        Class = await classes.findByIdAndDelete(req.params.classid)
        res.json({ id: id, message: "Class removed" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//remove teacher
router.delete('/teacher/:teacherid', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let User = await user.findById(req.params.teacherid)
        if (!User) { return res.status(404).send("Teacher not found") }
        if (User.role !== "teacher") { return res.status(400).send("This is not a teacher id!!") }
        const id = User.id
        let Class = await classes.find({ teacher: id })
        if (Class) {
            Class = await classes.updateMany({ teacher: id }, { $pull: { teacher: id } })
        }
        User = await user.findByIdAndDelete(req.params.teacherid)
        res.json({ id: id, message: "Teacher removed" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//remove student
router.delete('/student/:studentid', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let User = await user.findById(req.params.studentid)
        if (!User) { return res.status(404).send("Student not found") }
        if (User.role !== "student") { return res.status(400).send("This is not a student id!!") }
        const id = User.id
        let Class = await classes.find({ student: id })
        if (Class) {
            Class = await classes.updateMany({ student: id }, { $pull: { student: id } })
        }
        let scard = await scorec.find({ sid: id })
        if (scard) {
            scard = await scorec.deleteMany({ sid: id })
        }
        User = await user.findByIdAndDelete(req.params.studentid)
        res.json({ id: id, message: "Student removed" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//update class
router.put('/classup/:classid', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    const { name, teacher, student } = req.body
    try {
        let Class = await classes.findById(req.params.classid)
        if (!Class) { return res.status(404).send("Class not found") }
        const id = Class.id
        Class = await classes.findByIdAndUpdate(req.params.classid, {
            $set: {
                name: name,
                teacher: teacher,
                student: student,
                date: new Date()
            }
        })
        res.json({ id: id, message: "Class Updated" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//Map teacher to class
router.post('/teacher/:teacherid/class/:classid', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let Class = await classes.findById(req.params.classid)
        if (!Class) { return res.status(404).send("Class not found") }
        let User = await user.findById(req.params.teacherid)
        if (!User) { return res.status(404).send("Teacher not found") }
        if (User.role !== "teacher") { return res.status(400).send("This is not a teacher id!!") }
        let exist = Class.teacher.includes(req.params.teacherid)
        if (exist) { return res.status(400).json({ errors: 'Teacher already mapped to the class' }); }
        Class = await classes.findByIdAndUpdate(req.params.classid, {
            $push: {
                teacher: req.params.teacherid
            }
        })
        res.json({ message: "Teacher added to class" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

//Map student to class
router.post('/student/:studentid/class/:classid', fetchuser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json("Unauthorized access")
    }
    try {
        let Class = await classes.findById(req.params.classid)
        if (!Class) { return res.status(404).send("Class not found") }
        let User = await user.findById(req.params.studentid)
        if (!User) { return res.status(404).send("Student not found") }
        if (User.role !== "student") { return res.status(400).send("This is not a student id!!") }
        let exist = Class.student.includes(req.params.studentid)
        if (exist) { return res.status(400).json({ errors: 'Student already mapped to the class' }); }
        Class = await classes.findByIdAndUpdate(req.params.classid, {
            $push: {
                student: req.params.studentid
            }
        })
        res.json({ message: "Student added to class" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

module.exports = router