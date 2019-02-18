router.post('/user-settings/change-email', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let newEmail = req.body.newEmail;
  let confirmEmail = req.body.confirmEmail;

  req.checkBody('newEmail', 'New email field is required.').notEmpty();
  req.checkBody('confirmEmail', 'New email does not match email confirmation field.').equals(newEmail);

  let formErrors = req.validationErrors();
  if (formErrors) {
	    req.flash('error', formErrors[0].msg);
      return res.redirect('/user-settings');
  }

  con.query(`UPDATE users SET email=${mysql.escape()}; WHERE email=`, (error, results, fields) => {
    if (error) {
          console.log(error.stack);
          con.end();
          return;
    }
    if (results.length === 0) {
      req.flash('error', 'Error.');
      con.end();
      return res.redirect('/user-settings');
    } else if (results.length === 1) {
      con.end();
      return res.render('platform/user-settings.hbs', {
        email: results[0].email,
        error: req.flash('error'),
      });
    } else {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/user-settings');
    }
  });
});
