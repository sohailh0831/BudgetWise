var WizardDemo = function() {
    $("#m_wizard");
    var e, r, i = $("#m_form");
    return {
        init: function() {
            var n;
            $("#m_wizard"), i = $("#m_form"), (r = new mWizard("m_wizard", {
                startStep: 1
            })).on("beforeNext", function(r) {
                !0 !== e.form() && r.stop()
            }), r.on("change", function(e) {
                mUtil.scrollTop()
            }), r.on("change", function(e) {
                //1 === e.getStep() && alert(1)
              if (e.getStep() === 2) {
                $.ajax("/check-order-before-submit", {
                            type: 'POST',
                            data: {
                              orderName: $("#orderID").val(),
                              orderEmail: $("#orderEmailAddress").val(),
                            },
                            success: function (result) {
                                if (result.exists === true) {
                                } else if (result.exists === false) {
                                  mUtil.scrollTop(), swal({
                                      title: "",
                                      text: "This order was not found. Please double check the order number and order email address.",
                                      type: "error",
                                      confirmButtonClass: "btn btn-secondary m-btn m-btn--wide"
                                  })
                                  .then(result => {
                                    location.reload();
                                  })
                                }
                            }
                          })
              }
            }), e = i.validate({
                ignore: ":hidden",
                rules: {
                    orderID: {
                        required: !0
                    },
                    accept: {
                        required: !0
                    },
                    orderEmailAddress: {
                        required: !0
                    },
                    instagramUsername: {
                        required: !0
                    },
                    caption: {
                        required: !0
                    },
                    photoUpload: {
                        required: !0
                    }
                },
                messages: {
                    accept: {
                        required: "You must accept the Terms and Conditions agreement!"
                    },
                },
                invalidHandler: function(e, r) {
                    mUtil.scrollTop(), swal({
                        title: "",
                        text: "There are some errors in your submission. Please correct them.",
                        type: "error",
                        confirmButtonClass: "btn btn-secondary m-btn m-btn--wide"
                    })
                },
                submitHandler: function(e) {}
            }), (n = i.find('[data-wizard-action="submit"]')).on("click", function(r) {
                r.preventDefault(), e.form() && (mApp.progress(n), i.ajaxSubmit({
                    success: function() {
                        mApp.unprogress(n), swal({
                            title: "",
                            text: "The submission has been successfully submitted!",
                            type: "success",
                            confirmButtonClass: "btn btn-secondary m-btn m-btn--wide",
                        })
                        .then((result) => {
                          location.reload();
                        })
                    }
                }))
            })
        }
    }
}();
jQuery(document).ready(function() {
    WizardDemo.init()
});
