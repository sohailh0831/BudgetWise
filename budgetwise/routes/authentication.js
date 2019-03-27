const express = require('express');
const session = require('express-session');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt= require('bcryptjs');
const uuidv4 = require('uuid/v4');
const passport = require("passport");
const flash = require('connect-flash');
var request = require("request");
const mysql = require('mysql');
const nodemailer = require('nodemailer');
let dbInfo = {
  host: "localhost",
  user: "root",
  password: "BudgetWise1234!",
  database : 'budgetwise'
};
let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'budgetwisepurdue@gmail.com',
        pass: 'BudgetWise1234!'
    }
});

const LocalStrategy = require('passport-local').Strategy;
const AuthenticationFunctions = require('../helper/Authentication');

// Index Route
router.get('/', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.redirect('/dashboard');
});

// Login Route
router.get('/login', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  return res.render('platform/login.hbs', {
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/login', AuthenticationFunctions.ensureNotAuthenticated, passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }), (req, res) => {
  res.redirect('/dashboard');
});

router.get('/logout', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.logout();
  req.session.destroy();
  return res.redirect('/login');
});

// Register Route
router.get('/register', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  return res.render('platform/register.hbs', {
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/register', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.password2;
    if (req.body.password.includes(' ') || req.body.password2.includes(' ')) {
      req.flash('error', 'Password cannot contain spaces.');
      return res.redirect('/register');
    }
    if (req.body.password.length < 4 || req.body.password2.length < 4) {
      req.flash('error', 'Password must be longer than 3 characters.');
      return res.redirect('/register');
    }
    req.checkBody('firstName', 'First Name field is required.').notEmpty();
    req.checkBody('lastName', 'Last Name field is required.').notEmpty();
    req.checkBody('username', 'Username field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('password', 'New Password field is required.').notEmpty();
    req.checkBody('password2', 'Confirm New password field is required.').notEmpty();
	  req.checkBody('password2', 'New password does not match confirmation password field.').equals(req.body.password);
    let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect('/register');
	  }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE username=${mysql.escape(req.body.username)} OR email=${mysql.escape(req.body.email)} OR parental_username=${mysql.escape(req.body.email)};`, (error, results, fields) => {
      if (error) {
        console.log(error.stack);
        con.end();
        return res.send();
      }
      if (results.length === 0) {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);
        let userID = uuidv4();
        con.query(`INSERT INTO users (id, email, username, password, first_name, last_name) VALUES (${mysql.escape(userID)}, ${mysql.escape(req.body.email)}, ${mysql.escape(req.body.username)}, '${hashedPassword}', ${mysql.escape(req.body.firstName)}, ${mysql.escape(req.body.lastName)});`, (error, results, fields) => {
          if (error) {
            console.log(error.stack);
            con.end();
            return;
          }
          if (results) {
            console.log(`${req.body.email} successfully registered.`);
            // bills, travel, food, entertainment
            let billsName = "Bills";
            let billsID = uuidv4();
            let travelName = "Travel";
            let travelID = uuidv4();
            let foodName = "Food";
            let foodID = uuidv4();
            let entertainmentName = "Entertainment";
            let entertainmentID = uuidv4();
            let retirementName = "Retirement";
            let retirementID = uuidv4();
            con.query(`INSERT INTO categories (id, name, owner) VALUES (${mysql.escape(billsID)}, ${mysql.escape(billsName)}, ${mysql.escape(userID)})`, (error, results, fields) => {
              if (error) {
                  console.log(error.stack);
                  con.end();
                  return res.send();
              }
              con.query(`INSERT INTO categories (id, name, owner) VALUES (${mysql.escape(travelID)}, ${mysql.escape(travelName)}, ${mysql.escape(userID)})`, (error, results, fields) => {
                if (error) {
                    console.log(error.stack);
                    con.end();
                    return res.send();
                }
                con.query(`INSERT INTO categories (id, name, owner) VALUES (${mysql.escape(foodID)}, ${mysql.escape(foodName)}, ${mysql.escape(userID)})`, (error, results, fields) => {
                  if (error) {
                      console.log(error.stack);
                      con.end();
                      return res.send();
                  }
                  con.query(`INSERT INTO categories (id, name, owner) VALUES (${mysql.escape(entertainmentID)}, ${mysql.escape(entertainmentName)}, ${mysql.escape(userID)})`, (error, results, fields) => {
                    if (error) {
                        console.log(error.stack);
                        con.end();
                        return res.send();
                    }
                    con.query(`INSERT INTO categories (id, name, owner) VALUES (${mysql.escape(retirementID)}, ${mysql.escape(retirementName)}, ${mysql.escape(userID)})`, (error, results, fields) => {
                      if (error) {
                          console.log(error.stack);
                          con.end();
                          return res.send();
                      }
                      con.end();
                      req.flash('success', 'Successfully registered. You may now login.');
                      return res.redirect('/login');
                    });
                  });
                });
              });
            });
          } else {
            con.end();
            req.flash('error', 'Error Registering. Please try again.');
            return res.redirect('/register');
          }
        });
      } else {
        req.flash('error', "This username or email has already been registered or exists as a parental account.");
        con.end();
        return res.redirect('/register');
      }
    });
});

// Register Route
router.get('/forgot-password', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  return res.render('platform/forgot-password.hbs', {
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/forgot-password', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  req.flash('success', "If this email exists in our system, you will get a password reset email.");
  res.redirect('/forgot-password');
  let userEmail = req.body.username;
  let formErrors = req.validationErrors();
  if (formErrors) {
      req.flash('error', formErrors[0].msg);
      return res.redirect('/forgot-password');
  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE username=${mysql.escape(userEmail)} OR email=${mysql.escape(userEmail)};`, (error, results, fields) => {
    if (error) {
      console.log(error.stack);
      con.end();
      return res.send();
    }
    if (results.length === 1) {
      let randomID = uuidv4(); // get random new ID. this will be added to the password reset URL we email them so it's fulyl randomized and can't be bruteforced.
      con.query(`UPDATE users SET forgot_password='${randomID}' WHERE username=${mysql.escape(userEmail)} OR email=${mysql.escape(userEmail)};`, (error, resultsUpdate, fields) => {
        if (error) {
          console.log(error.stack);
          con.end();
          return;
        }
          let passwordResetURL = `http://167.99.156.25/reset-password/${randomID}`;
          let emailContent = `<p>Hi ${results[0].first_name} ${results[0].last_name},<br><br>Please use the following link to reset your password: ${passwordResetURL}</p><p><br>Best,</p><p>BudgetWise Team</p>`;
          const mailOptions = {
            from: 'budgetwisepurdue@gmail.com',
            to: results[0].email,
            subject: 'Password Reset for BudgetWise',
            html: emailContent
          };
          transporter.sendMail(mailOptions, function (err, info) {
             if(err)
               console.log(err)
             else
               console.log(info);
          });
          con.end();
      });
    } else {
      con.end();
    }
  });
});

// //Parental Route
// router.get('/parental', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
//   return res.render('platform/parental.hbs', {
//     error: req.flash('error'),
//     success: req.flash('success')
//   });
// });

// router.post('/parental', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
//   let username = req.body.username;
//   let password = req.body.password;
//   let confirmPassword = req.body.password2;
//   console.log(req.body);
//     if (req.body.password.includes(' ') || req.body.password2.includes(' ')) {
//       req.flash('error', 'Password cannot contain spaces.');
//       return res.redirect('/parental');
//     }
//     if (req.body.password.length < 4 || req.body.password2.length < 4) {
//       req.flash('error', 'Password must be longer than 3 characters.');
//       return res.redirect('/parental');
//     }
//     req.checkBody('username', 'Username field is required.').notEmpty();
//     req.checkBody('password', 'New Password field is required.').notEmpty();
//     req.checkBody('password2', 'Confirm New password field is required.').notEmpty();
// 	  req.checkBody('password2', 'New password does not match confirmation password field.').equals(req.body.password);
//     let formErrors = req.validationErrors();
//     if (formErrors) {
// 		    req.flash('error', formErrors[0].msg);
//         return res.redirect('/parental');
// 	  }
//     let con = mysql.createConnection(dbInfo);
//     con.query(`SELECT * FROM users WHERE username=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
//       if (error) {
//         console.log(error.stack);
//         con.end();
//         return res.send();
//       }
//       if (results.length === 0) {
//         let salt = bcrypt.genSaltSync(10);
//         let hashedPassword = bcrypt.hashSync(req.body.password, salt);
//         let userID = uuidv4();
//         con.query(`UPDATE users SET parental_username=${mysql.escape(req.body.username)} , parental_password='${hashedPassword}' WHERE userID=${mysql.escape(req.user.identifier)};`, (error, results, fields) => {
//           if (error) {
//             console.log(error.stack);
//             con.end();
//             return;
//           }
//           if (results) {
//             console.log(`${req.body.email} successfully registered.`);
//                     req.flash('success', 'Successfully Added Parental Account.');
//                     return res.redirect('/dashboard');
//           } else {
//             con.end();
//             req.flash('error', 'Error Adding Parental Account. Please try again.');
//             return res.redirect('/parental');
//           }
//         });
//       } else {
//         req.flash('error', "This username or email has already been registered.");
//         con.end();
//         return res.redirect('/parental');
//       }
//     });
// });




router.get('/reset-password/:resetPasswordID', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE forgot_password=${mysql.escape(req.params.resetPasswordID)};`, (error, results, fields) => {
    if (error) {
          console.log(error.stack);
          con.end();
          return;
    }
    if (results.length === 0) {
      req.flash('error', 'Error.');
      con.end();
      return res.redirect('/login');
    } else if (results.length === 1) {
      con.end();
      return res.render('platform/reset-password.hbs', {
        resetPasswordID: req.params.resetPasswordID,
        email: results[0].email,
        error: req.flash('error'),
      });
    } else {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/login');
    }
  });
});

router.post('/reset-password/:resetPasswordID', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  let newPassword = req.body.newPassword;
  let newPassword2 = req.body.newPassword2;
  if (newPassword.includes(' ') || newPassword2.includes(' ')) {
      req.flash('error', 'New Password cannot contain spaces.');
      return res.redirect(`/reset-password/${req.params.resetPasswordID}`);
    }
    if (newPassword.length < 4 || newPassword2.length < 4) {
      req.flash('error', 'Password must be longer than 3 characters.');
      return res.redirect(`/reset-password/${req.params.resetPasswordID}`);
    }
    req.checkBody('newPassword', 'New password field is required.').notEmpty();
    req.checkBody('newPassword2', 'Confirm New password field is required.').notEmpty();
	  req.checkBody('newPassword2', 'New password does not match confirmation password field.').equals(req.body.newPassword);
    let formErrors = req.validationErrors();
    if (formErrors) {
		    req.flash('error', formErrors[0].msg);
        return res.redirect(`/reset-password/${req.params.resetPasswordID}`);
	  }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE forgot_password=${mysql.escape(req.params.resetPasswordID)};`, (error, results, fields) => {
      if (error) {
            console.log(error.stack);
            con.end();
            return;
      }
      if (results.length === 0) {
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/login');
      } else if (results.length === 1) {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
        con.query(`UPDATE users SET password='${hashedPassword}', forgot_password='' WHERE forgot_password=${mysql.escape(req.params.resetPasswordID)};`, (error, results, fields) => {
          if (error) {
            console.log(error.stack);
            con.end();
            return;
          }
          con.end();
          req.flash('success', 'Password successfully changed. You may now login.');
          return res.redirect('/login');
        });
      } else {
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/login');
      }
    });
});


passport.use(new LocalStrategy({passReqToCallback: true,},
	function (req, username, password, done) {
      let con = mysql.createConnection(dbInfo);
      con.query(`SELECT * FROM users WHERE username=${mysql.escape(username)} OR email=${mysql.escape(username)} OR parental_username=${mysql.escape(username)};`, (error, results, fields) => {
        if (error) {
          console.log(error.stack);
          con.end();
          return;
        }
        if (results.length === 0) {
          con.end();
          return done(null, false, req.flash('error', 'Username/Email or Password is incorrect.'));
        } else {
          if (username === results[0].parental_username) {
            if (bcrypt.compareSync(password, results[0].parental_password)) {
              console.log(`${results[0].parental_username} successfully logged in.`);
              let user = {
                  identifier: results[0].id,
                  username: results[0].username,
                  firstName: results[0].first_name,
                  lastName: results[0].last_name,
              };
              con.end();
              return done(null, user);
            } else {
              con.end();
              return done(null, false, req.flash('error', 'Username/Email or Password is incorrect.'));
            }
          } else {
            if (bcrypt.compareSync(password, results[0].password)) {
              console.log(`${username} successfully logged in.`);
              let user = {
                  identifier: results[0].id,
                  username: results[0].username,
                  firstName: results[0].first_name,
                  lastName: results[0].last_name,
              };
              con.end();
              return done(null, user);
            } else {
              con.end();
              return done(null, false, req.flash('error', 'Username/Email or Password is incorrect.'));
            }
          }
        }
      });

}));

passport.serializeUser(function (uuid, done) {
	done(null, uuid);
});

passport.deserializeUser(function (uuid, done) {
  done(null, uuid);
});

module.exports = router;
