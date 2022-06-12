const express = require('express');
const router = express.Router();
const user = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_secret = '@ssignm3n+d0n3'

//login api
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        let User = await user.findOne({ email: email })
        if (!User) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' })
        }
        const comppass = password === User.password
        if (!comppass) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' })
        }
        const data = {
            user: {
                id: User.id,
                role: User.role
            }
        }
        const auth_token = jwt.sign(data, JWT_secret);
        res.json({ id: User.id, auth_token: auth_token, name: User.name, role: User.role, email: User.email })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('INTERNAL SERVER ERROR')
    }
})

module.exports = router