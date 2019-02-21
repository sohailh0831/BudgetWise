var FlotchartsDemo = function() {
    var t = function() {
        function t() {
            return Math.floor(21 * Math.random()) + 20
        }
        var e = [
                [1, t()],
                [2, t()],
                [3, 2 + t()],
                [4, 3 + t()],
                [5, 5 + t()],
                [6, 10 + t()],
                [7, 15 + t()],
                [8, 20 + t()],
                [9, 25 + t()],
                [10, 30 + t()],
                [11, 35 + t()],
                [12, 25 + t()],
                [13, 15 + t()],
                [14, 20 + t()],
                [15, 45 + t()],
                [16, 50 + t()],
                [17, 65 + t()],
                [18, 70 + t()],
                [19, 85 + t()],
                [20, 80 + t()],
                [21, 75 + t()],
                [22, 80 + t()],
                [23, 75 + t()],
                [24, 70 + t()],
                [25, 65 + t()],
                [26, 75 + t()],
                [27, 80 + t()],
                [28, 85 + t()],
                [29, 90 + t()],
                [30, 95 + t()]
            ],
            o = [
                [1, t() - 5],
                [2, t() - 5],
                [3, t() - 5],
                [4, 6 + t()],
                [5, 5 + t()],
                [6, 20 + t()],
                [7, 25 + t()],
                [8, 36 + t()],
                [9, 26 + t()],
                [10, 38 + t()],
                [11, 39 + t()],
                [12, 50 + t()],
                [13, 51 + t()],
                [14, 12 + t()],
                [15, 13 + t()],
                [16, 14 + t()],
                [17, 15 + t()],
                [18, 15 + t()],
                [19, 16 + t()],
                [20, 17 + t()],
                [21, 18 + t()],
                [22, 19 + t()],
                [23, 20 + t()],
                [24, 21 + t()],
                [25, 14 + t()],
                [26, 24 + t()],
                [27, 25 + t()],
                [28, 26 + t()],
                [29, 27 + t()],
                [30, 31 + t()]
            ];
        var a = null;
    };
    return {
        init: function() {
            ! 
                function() {
                    for (var t = [], e = 0; e <= 10; e += 1) t.push([e, parseInt(30 * Math.random())]);
                    var o = [];
                    for (e = 0; e <= 10; e += 1) o.push([e, parseInt(30 * Math.random())]);
                    var a = [];
                    for (e = 0; e <= 10; e += 1) a.push([e, parseInt(30 * Math.random())]);
                    var i = 0,
                        r = !0,
                        l = !1,
                        n = !1;

                    function s() {
                        $.plot($("#m_flotcharts_5"), [{
                            label: "sales",
                            data: t,
                            lines: {
                                lineWidth: 1
                            },
                            shadowSize: 0
                        }, {
                            label: "tax",
                            data: o,
                            lines: {
                                lineWidth: 1
                            },
                            shadowSize: 0
                        }, {
                            label: "profit",
                            data: a,
                            lines: {
                                lineWidth: 1
                            },
                            shadowSize: 0
                        }], {
                            series: {
                                stack: i,
                                lines: {
                                    show: l,
                                    fill: !0,
                                    steps: n,
                                    lineWidth: 0
                                },
                                bars: {
                                    show: r,
                                    barWidth: .5,
                                    lineWidth: 0,
                                    shadowSize: 0,
                                    align: "center"
                                }
                            },
                            grid: {
                                tickColor: "#eee",
                                borderColor: "#eee",
                                borderWidth: 1
                            }
                        })
                    }
                    $(".stackControls input").click(function(t) {
                        t.preventDefault(), i = "With stacking" == $(this).val() || null, s()
                    }), $(".graphControls input").click(function(t) {
                        t.preventDefault(), r = -1 != $(this).val().indexOf("Bars"), l = -1 != $(this).val().indexOf("Lines"), n = -1 != $(this).val().indexOf("steps"), s()
                    }), s()
                }()
        }
    }
}();
jQuery(document).ready(function() {
    FlotchartsDemo.init()
});