var FlotchartsDemo = function() {
    return {
        init: function() {
            !function() {
                var allowanceRemaining = document.getElementById("allowance").value - document.getElementById("spenditure").value;
                if(allowanceRemaining < 0) {
                  allowanceRemaining = 0;
                }
                var t = [];
                    t[0] = {
                      label: "Spenditure",
                      data: document.getElementById("spenditure").value,
                      color: '#282a3b',
                    },
                    t[1] = {
                      label: "Allowance",
                      data: allowanceRemaining,
                      color: '#C0BCCB',
                    },
                $.plot($("#m_flotcharts_8"), t, {
                    series: {
                        pie: {
                            show: true
                        }
                    }
                })
            }()
        }
    }
}();
jQuery(document).ready(function() {
    FlotchartsDemo.init()
});

