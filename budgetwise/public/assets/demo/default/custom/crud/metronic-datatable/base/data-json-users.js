var DatatableJsonRemoteDemo = {
    init: function() {
        var t, e;
      
        t = $(".m_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                  read: {
                    url: '/admin/get-users',
                    method: 'POST'
                  },
                },
            },
            layout: {
                theme: "default",
                class: "",
                scroll: !1,
                footer: !1
            },
            sortable: !0,
            pagination: !0,
            search: {
                input: $("#generalSearch")
            },
            columns: [{
                field: "username",
                title: "Username",
                width: 200,
            }, {
                field: "userlevel",
                title: "User Level",
                template: function(t) {
                  if (t.userlevel === 0) return 'User'
                  if (t.userlevel === 1) return 'Manager'
                  if (t.userlevel === 2) return 'Admin'
                }
            }, {
                field: "first_name",
                title: "First Name"
            }, {
                field: "last_name",
                title: "Last Name"
            }, {
                field: "active",
                title: "Status",
                template: function(t) {
                  if (t.active === 0) return 'Not Registered'
                  if (t.active === 1) return 'Registered'
                  if (t.active === 2) return 'Banned'
                }
            }, {
                field: "promocode",
                title: "Promo Code"
            }, {
                field: "instagramHandle",
                title: "Instagram"
            }, {
                field: "snapchatHandle",
                title: "Snapchat"
            }, {
                field: "facebookHandle",
                title: "Facebook"
            }, {
                field: "twitterHandle",
                title: "Twitter"
            }, {
                field: "pinterestHandle",
                title: "Pinterest"
            }, {
                field: "youtubeHandle",
                title: "Youtube"
            }, {
                field: "phone",
                title: "Phone"
            }, {
                field: "submissions",
                title: "Submission Count"
            }, {
                field: "identifier",
                title: "Actions",
                template: function(t) {
                  return `<a href="/admin/users/${t.identifier}" class="btn btn-primary m-btn m-btn--pill m-btn--air">Edit</a>`;
                }
            }]
        }), e = t.getDataSourceQuery(), $("#m_form_status").on("change", function() {
            t.search($(this).val(), "active")
        }).val(void 0 !== e.Status ? e.Status : ""), $("#m_form_type").on("change", function() {
            t.search($(this).val(), "userlevel")
        }).val(void 0 !== e.Type ? e.Type : ""), $("#m_form_status, #m_form_type").selectpicker()
    }
};
jQuery(document).ready(function() {
    DatatableJsonRemoteDemo.init()
});