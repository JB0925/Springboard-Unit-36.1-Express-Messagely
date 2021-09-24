const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async(req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Must include both username and password.", 400);
        }
        if (await User.authenticate(username, password)) {
            await User.updateLoginTimestamp(username);
            let token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token })
        }
        throw new ExpressError("Invalid login credentials.", 400);
    } catch (error) {
        return next(error)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async(req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        const user = await User.register(username, password, first_name, last_name, phone);
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch (error) {
        return next(error);
    };
});



module.exports = router;