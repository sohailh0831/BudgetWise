var DatatableJsonRemoteDemo = {
    init: function() {
        var t, e;
        
        var fullurl = window.location.pathname;
        var spliturl = fullurl.split("/");
        var part = spliturl[2];
        //var part = decodeURIComponent((new RegExp('[?|&]' + 'id' + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
        t = $(".m_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                  read: {
                    url: `/category-expenses/${part}`,
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
                width: 300,
            }, {
                field: "price",
                title: "Price",
                width: 200,
            }, {
                field: "recurring",
                title: "Recurring",
                width: 200,
                template: function(t) {
                  var e = {
                        0: {
                            value: "No"
                        },
                        1: {
                            value: "Yes"
                        }
                    };
                    return e[t.recurring].value;
                }
            }, {
                field: "creationDate",
                title: "Date",
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