var DatatableHtmlTableDemo = {
    init: function() {
        var e;
        e = $(".m-datatable").mDatatable({
            data: {
                saveState: {
                    cookie: !1
                }
            },
            search: {
                input: $("#generalSearch")
            },
            columns: [{
                field: "Name",
                type: "string"
            }, {
                field: "Price",
                type: "number",
            }, {
                field: "Recurring",
                type: "number",
            }, {
                field: "CarMake",
                type: "date",
            },
              
            ]
        }), $("#m_form_status").on("change", function() {
            e.search($(this).val().toLowerCase(), "Status")
        }), $("#m_form_type").on("change", function() {
            e.search($(this).val().toLowerCase(), "Type")
        }), $("#m_form_status, #m_form_type").selectpicker()
    }
};
jQuery(document).ready(function() {
    DatatableHtmlTableDemo.init()
});