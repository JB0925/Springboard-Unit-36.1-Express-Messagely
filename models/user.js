const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
/** User class for message.ly */



/** User of the site. */

class User {
  /** Returns a string version of the date without the timezone information. */
  static getDateWithoutTimezone(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  }
  
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({username, password, first_name, last_name, phone}) {
    try {
      if (!username || !password || !first_name || !last_name || !phone) {
        throw new ExpressError(`You must provide username, password, 
                                first and last name, and phone number to register.`, 400);
      };
      let join_at = new Date();
      join_at = this.getDateWithoutTimezone(join_at);
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      const result = await db.query(
        `INSERT INTO users
        (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone, join_at, new Date()]
      );
      return result.rows[0];

    } catch (error) {
      if (error.code === 23505) {
        throw new ExpressError("Username taken. Please choose another.", 400);
      }
      return error;
    };
  };

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    try {
      const result = await db.query(
        `SELECT username, password
         FROM users
         WHERE username = $1`,
         [username]
      );
      const user = result.rows[0];
      if (user) {
        if (await bcrypt.compare(password, user.password) === true) {
          return true;
        }
      }
      return false;
    } catch (error) {
        return error
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    try {
      const updatedUser = await db.query(
        `UPDATE users
         SET last_login_at = CURRENT_TIMESTAMP
         WHERE username = $1`,
         [username]
      )
      if (!updatedUser.rows.length) throw new ExpressError("Username not found.", 400);
    } catch (error) {
      return error
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    try {
      const results = await db.query(
        `SELECT username, first_name, last_name, phone
         FROM users`
      );
      return results.rows;
    } catch (error) {
      return error;
    };
  };

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    try {
      const result = await db.query(
        `SELECT username, first_name,
                last_name, phone,
                join_at, last_login_at
         FROM users
         WHERE username = $1`,
         [username]
      );
      if (!result.rows.length) throw new ExpressError("User not found.", 400);
      return result.rows[0];

    } catch (error) {
      return error
    };
  };

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    try {
      const user = await this.get(username);
      const result = await db.query(
        `SELECT id, to_username, body, sent_at, read_at
        FROM messages
        WHERE from_username = $1`,
        [username]
      );
      let messages = result.rows
      
      for (let msg of messages) {
        const info = await db.query(
          `SELECT username, first_name, last_name, phone
           FROM users
           WHERE username = $1`,
           [msg.to_username]
        );
        msg.to_user = info.rows[0];
        delete msg.to_username;
      };
      return messages;
      
    } catch (error) {
      return error
    }
    
  };

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    try {
      const user = await this.get(username);
      const result = await db.query(
        `SELECT id, from_username, body, sent_at, read_at
        FROM messages
        WHERE to_username = $1`,
        [username]
      );
      let messages = result.rows
      for (let msg of messages) {
        const info = await db.query(
          `SELECT username, first_name, last_name, phone
           FROM users
           WHERE username = $1`,
           [msg.from_username]
        );
        msg.from_user = info.rows[0];
        delete msg.from_username;
      };
      return messages;
    } catch (error) {
      return error
    };
  };
};


module.exports = User;