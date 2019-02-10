var DatatableJsonRemoteDemo = {
    init: function() {
        var t, e;
      
        t = $(".m_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                  read: {
                    url: '/admin/get-submissions',
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
                field: "submissiondate",
                title: "Date Submitted",
                width: 200,
            }, {
                field: "approvalStatus",
                title: "Status",
            }, {
                field: "orderid",
                title: "Order ID",
                width: 75
            }, {
                field: "orderemailaddress",
                title: "Order Email",
                width: 250,
            }, {
                field: "instagramusername",
                title: "IG Username",
            }, {
                field: "engagement_choice",
                title: "Engagement Choice"
            }, {
                field: "identifier",
                title: "Actions",
                template: function(t) {
                  return `<a href="/admin/submissions/${t.identifier}" class="btn btn-primary m-btn m-btn--pill m-btn--air">Edit</a>`;
                }
            }]
        }), e = t.getDataSourceQuery(), $("#m_form_status").on("change", function() {
            t.search($(this).val(), "approvalStatus")
        }).val(void 0 !== e.Status ? e.Status : ""), $("#m_form_status, #m_form_type").selectpicker()
    }
};
jQuery(document).ready(function() {
    DatatableJsonRemoteDemo.init()
});