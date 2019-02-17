var FlotchartsDemo = function() {
    return {
        init: function() {
            !function() {
                var t = [],
                    e = 2;
                //e = e < 5 ? 5 : e;
                for (var o = 0; o < e; o++)
                    t[o] = {
                        label: "Series" + (o + 1),
                        data: Math.floor(100 * Math.random()) + 1
                    };
                $.plot($("#m_flotcharts_8"), t, {
                    series: {
                        pie: {
                            show: !0
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

