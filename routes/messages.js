const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const db = require("../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", async(req, res, next) => {
    try {
        const id = req.params.id;
        const token = jwt.verify(req.body._token, SECRET_KEY);
        const username = token.username
        const message = await Message.get(id);

        if (message.from_user.username !== username && message.to_user.username !== username) {
            throw new ExpressError("You are not the recipient nor the sender of this message", 400);
        }
        return res.json({ message });
    } catch (error) {
        return next(error);
    };
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async(req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body.message;
        if (!from_username || !to_username || !body) {
            throw new ExpressError("Must provide all data to create a message.", 400);
        };
        
        const newMessage = await Message.create({from_username, to_username, body});
        return res.json({ message: newMessage });

    } catch (error) {
        return next(error);
    };
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id", ensureLoggedIn, async(req, res, next) => {
    try {
        const id = req.params.id;
        const username = req.user.username;
        const query = await db.query(
            `SELECT *
             FROM messages
             WHERE id = $1
             AND to_username = $2`,
             [id, username]
        );
        if (!query.rows.length) throw new ExpressError("Sorry, this message is not intended for you.", 400);

        const markedAsRead = await Message.markRead(id);
        return res.json({ message: markedAsRead })
    } catch (error) {
        return next(error);
    };
});

module.exports = router;
