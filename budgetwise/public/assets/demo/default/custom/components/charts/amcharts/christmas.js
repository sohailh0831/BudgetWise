var FlotchartsDemo = function() {
    return {
        init: function() {
            !function() {
//                 var allowanceRemaining = document.getElementById("allowance").value - document.getElementById("spenditure").value;
//                 if(allowanceRemaining < 0) {
//                   allowanceRemaining = 0;
//                 }
                var t = [];
                    t[0] = {
                      label: "Spenditure",
                      data: 40,
                      color: '#282a3b',
                    },
                    t[1] = {
                      label: "Allowance",
                      data: 60,
                      color: '#C0BCCB',
                    },
                $.plot($("#m_flotcharts_9"), t, {
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


