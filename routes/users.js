const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async(req, res, next) => {
    try {
        const allUsers = await User.all();
        return res.json(allUsers);
    } catch (error) {
        return next(error);
    };
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async(req, res, next) => {
    try {
        const username = req.params.username;
        const user = await User.get(username);
        return res.json(user);
    } catch (error) {
        return next(error);
    };
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async(req, res, next) => {
    try {
        const username = req.params.username;
        const toMessages = await User.messagesTo(username);
        return res.json(toMessages);
    } catch (error) {
        return next(error);
    };
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async(req, res, next) => {
    try {
        const username = req.params.username;
        const fromMessages = await User.messagesFrom(username);
        return res.json(fromMessages);
    } catch (error) {
        return next(error);
    };
});




module.exports = router;