var DatatableJsonRemoteDemo = {
    init: function() {
        var t, e;
      
        t = $(".m_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                  read: {
                    url: '/categories/get-user-categories',
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
                field: "name",
                title: "Name",
                width: 400,
            }, {
                field: "expenses",
                title: "Expenses",
                width: 400,
            }, {
                field: "id",
                title: "Analysis",
                template: function(t) {
                  return `<a href="/category/${t.id}" class="btn btn-primary m-btn m-btn--pill m-btn--air">View</a>`;
                }
            }]
        })
    }
};
jQuery(document).ready(function() {
    DatatableJsonRemoteDemo.init()
});