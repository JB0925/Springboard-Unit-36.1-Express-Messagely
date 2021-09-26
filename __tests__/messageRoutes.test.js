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


describe("GET /:id", () => {
    test("Does the GET message by id route work when given a valid id?", async() => {
        const resp = await request(app).get(`/messages/${msg1.id}`).send({ _token: testUserToken2});
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.message.body).toEqual("I like fries.");
    });
    test("Does the GET message by id route throw an error when given an invalid token?", async() => {
        const bogusToken = jwt.sign({username: "carlos"}, SECRET_KEY);
        const resp = await request(app).get(`/messages/${msg1.id}`).send({ _token: bogusToken });
        expect(resp.statusCode).toBe(400);
        expect(resp.body.error.message).toEqual("You are not the recipient nor the sender of this message");
    });
});

describe("POST /", () => {
    test("Does the POST messages route work when given a valid request body?", async() => {
        const message = {
            from_username: "tim",
            to_username: "joe",
            body: "hey there, how are you?"
        };
        const resp = await request(app).post("/messages").send({ _token: testUserToken2, message });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.message.body).toEqual("hey there, how are you?");
    });
    test("Does the POST messages route throw a 400 error when given an invalid request body?", async() => {
        const message = {
            from_username: "tim",
            to_username: "joe",
        };
        const resp = await request(app).post("/messages").send({ _token: testUserToken2, message });
        expect(resp.statusCode).toBe(400);
        expect(resp.body.error.message).toEqual("Must provide all data to create a message.");
    });
});

describe("POST /:id", () => {
    test("Does the POST mark-message-as-read route work correctly, given a logged in user who is the recipient of the message?", async() => {
        expect(msg1.read_at).toEqual(undefined);
        const resp = await request(app).post(`/messages/${msg1.id}`).send({ _token: testUserToken2 });
        expect(resp.statusCode).toBe(200);
        expect(resp.body.message.read_at).toEqual(expect.any(String));
    });
    test("Does the POST mark-message-as-read route throw an error, given a logged in user who is NOT the recipient of the message?", async() => {
        expect(msg1.read_at).toEqual(undefined);
        const resp = await request(app).post(`/messages/${msg1.id}`).send({ _token: testUserToken });
        expect(resp.statusCode).toBe(400);
        expect(resp.body.message.read_at).not.toEqual(expect.any(String));
        expect(resp.body.error.message).toEqual("Sorry, this message is not intended for you.");
    });
});