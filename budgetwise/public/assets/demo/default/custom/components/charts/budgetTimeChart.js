var FlotchartsDemo = function() {
    var t = function() {
        function t() {
            return Math.floor(21 * Math.random()) + 20
        }
        var e = [
                
            ],
            o = [
                
            ];
        $.plot($("#m_flotcharts_2"), [{
            data: e,
            label: "Unique Visits",
            lines: {
                lineWidth: 1
            },
            shadowSize: 0
        }, {
            data: o,
            label: "Page Views",
            lines: {
                lineWidth: 1
            },
            shadowSize: 0
        }], {
            series: {
                lines: {
                    show: !0,
                    lineWidth: 2,
                    fill: !0,
                    fillColor: {
                        colors: [{
                            opacity: .05
                        }, {
                            opacity: .01
                        }]
                    }
                },
                points: {
                    show: !0,
                    radius: 3,
                    lineWidth: 1
                },
                shadowSize: 2
            },
            grid: {
                hoverable: !0,
                clickable: !0,
                tickColor: "#eee",
                borderColor: "#eee",
                borderWidth: 1
            },
            colors: ["#d12610", "#37b7f3", "#52e136"],
            xaxis: {
                ticks: 11,
                tickDecimals: 0,
                tickColor: "#eee"
            },
            yaxis: {
                ticks: 11,
                tickDecimals: 0,
                tickColor: "#eee"
            }
        });
        var a = null;
        $("#chart_2").bind("plothover", function(t, e, o) {
            if ($("#x").text(e.x.toFixed(2)), $("#y").text(e.y.toFixed(2)), o) {
                if (a != o.dataIndex) {
                    a = o.dataIndex, $("#tooltip").remove();
                    var i = o.datapoint[0].toFixed(2),
                        r = o.datapoint[1].toFixed(2);
                    ! function(t, e, o) {
                        $('<div id="tooltip">' + o + "</div>").css({
                            position: "absolute",
                            display: "none",
                            top: e + 5,
                            left: t + 15,
                            border: "1px solid #333",
                            padding: "4px",
                            color: "#fff",
                            "border-radius": "3px",
                            "background-color": "#333",
                            opacity: .8
                        }).appendTo("body").fadeIn(200)
                    }(o.pageX, o.pageY, o.series.label + " of " + i + " = " + r)
                }
            } else $("#tooltip").remove(), a = null
        })
    };
    return {
        init: function() {
            ! function() {
                for (var t = [], e = 0; e < 2 * Math.PI; e += .25) t.push([e, Math.sin(e)]);
                var o = [];
                for (e = 0; e < 2 * Math.PI; e += .25) o.push([e, Math.cos(e)]);
                var a = [];
                for (e = 0; e < 2 * Math.PI; e += .1) a.push([e, Math.tan(e)]);
                $.plot($("#m_flotcharts_1"), [{
                    label: "sin(x)",
                    data: t,
                    lines: {
                        lineWidth: 1
                    },
                    shadowSize: 0
                }, {
                    label: "cos(x)",
                    data: o,
                    lines: {
                        lineWidth: 1
                    },
                    shadowSize: 0
                }, {
                    label: "tan(x)",
                    data: a,
                    lines: {
                        lineWidth: 1
                    },
                    shadowSize: 0
                }], {
                    series: {
                        lines: {
                            show: !0
                        },
                        points: {
                            show: !0,
                            fill: !0,
                            radius: 3,
                            lineWidth: 1
                        }
                    },
                    xaxis: {
                        tickColor: "#eee",
                        ticks: [0, [Math.PI / 2, "π/2"],
                            [Math.PI, "π"],
                            [3 * Math.PI / 2, "3π/2"],
                            [2 * Math.PI, "2π"]
                        ]
                    },
                    yaxis: {
                        tickColor: "#eee",
                        ticks: 10,
                        min: -2,
                        max: 2
                    },
                    grid: {
                        borderColor: "#eee",
                        borderWidth: 1
                    }
                })
            }(), t(),
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