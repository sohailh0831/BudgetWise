var DatatableJsonRemoteDemo = {
    init: function() {
        var t, e;
      
        t = $(".m_datatableBudgets").mDatatable({
            data: {
                type: "remote",
                source: {
                  read: {
                    url: '/budgets/get-user-budgets',
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
                input: $("#generalSearchBudgets")
            },
            columns: [{
                field: "name",
                title: "Name",
                width: 200,
            }, {
                field: "allowance",
                title: "Allowance",
            }, {
                field: "amountSpent",
                title: "Amount Spent"
            }, {
                field: "startDate",
                title: "Start Date"
            }, {
                field: "endDate",
                title: "End Date",
            }, {
                field: "identifier",
                title: "Analytics",
                template: function(t) {
                  return `<a href="/budgets/${t.id}" class="btn btn-primary m-btn m-btn--pill m-btn--air">View</a>`;
                }
            }]
        }), e = t.getDataSourceQuery(), $("#m_form_statusBudgets").on("change", function() {
            t.search($(this).val(), "active")
        }).val(void 0 !== e.Status ? e.Status : ""), $("#m_form_typeBudgets").on("change", function() {
            t.search($(this).val(), "userlevel")
        }).val(void 0 !== e.Type ? e.Type : ""), $("#m_form_statusBudgets, #m_form_typeBudgets").selectpicker()
    }
};
jQuery(document).ready(function() {
    DatatableJsonRemoteDemo.init()
});