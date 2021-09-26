process.env.NODE_ENV = "test";
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY}  = require("../config");


let user;
let user2;
let msg1;
let msg2;
let testUserToken;
let testUserToken2;
beforeEach(async() => {
    let firstQuery = await db.query(
        `INSERT INTO users
         (username, password, first_name, last_name, phone, join_at, last_login_at)
         VALUES
         ('joe', 'banana', 'joe', 'smith', '14342650098', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING username, first_name, last_name, phone, join_at, last_login_at`
    )
    user = firstQuery.rows[0];

    let secondQuery = await db.query(
        `INSERT INTO users
         (username, password, first_name, last_name, phone, join_at, last_login_at)
         VALUES
         ('tim', 'cookie', 'timmy', 'jones', '15713330987', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING username, first_name, last_name, phone, join_at, last_login_at`
    )
    user2 = secondQuery.rows[0];
    
    testUserToken = jwt.sign("joe", SECRET_KEY);
    testUserToken2 = jwt.sign({username: "tim"}, SECRET_KEY);

    msg1 = await Message.create({from_username: 'joe', to_username: 'tim', body: 'I like fries.'});
    msg2 = await Message.create({from_username: 'tim', to_username: 'joe', body: 'me too'});
});

afterEach(async() => {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM messages");
});

afterAll(async() => {
    await db.end();
});


describe("GET /", () => {
    test("Does the main users GET route return info about all users?", async() => {
        const resp = await request(app).get("/users").send({ _token: testUserToken2 });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.length).toBe(2);
    });
    test("Does the main users GET route throw an error if a user is not logged in?", async() => {
        const resp = await request(app).get("/users").send({ _token: "garbage" });
        expect(resp.statusCode).toBe(401);
    });
});

describe("GET /:username", () => {
    test("Does the individual user GET route return user data if given the correct token?", async() => {
        const resp = await request(app).get("/users/tim").send({ _token: testUserToken2});
        expect(resp.statusCode).toBe(200)
        expect(resp.body.username).toEqual("tim");
        expect(resp.body.first_name).toEqual("timmy");
    });
    test("Does the individual user GET route return a 401 status code if the user is trying access someone else's page?", async() => {
        const resp = await request(app).get("/users/rachel").send({ _token: testUserToken2 });
        expect(resp.statusCode).toBe(401);
        expect(resp.body.error.message).toEqual("Unauthorized");
    });
});

describe("GET /:username/to", () => {
    test("Does the GET messages-to route work with a logged in user trying to access their own messages?", async() => {
        const resp = await request(app).get("/users/tim/to").send({ _token: testUserToken2 });
        expect(resp.statusCode).toBe(200);
        expect(resp.body[0].from_user.username).toEqual("joe");
        expect(resp.body[0].body).toEqual("I like fries.");
    });
    test("Does the GET messages-to route throw a 401-unauthorized error if the token does not match the username in the route?", async() => {
        const resp = await request(app).get("/users/tim/to").send({ _token: testUserToken });
        expect(resp.statusCode).toBe(401);
        expect(resp.body.error.message).toEqual("Unauthorized");
    });
});

describe("GET /:username/from", () => {
    test("Does the GET messages-from route work with a logged in user trying to access their own messages?", async() => {
        const resp = await request(app).get("/users/tim/from").send({ _token: testUserToken2 });
        expect(resp.statusCode).toBe(200);
        expect(resp.body[0].body).toEqual("me too");
    });
    test("Does the GET messages-from route throw a 401-unauthorized error if the token does not match the username in the route?", async() => {
        const resp = await request(app).get("/users/tim/from").send({ _token: testUserToken });
        expect(resp.statusCode).toBe(401);
        expect(resp.body.error.message).toEqual("Unauthorized");
    });
});