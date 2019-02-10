var CalendarGoogle = {
    init: function() {
        $("#m_calendar").fullCalendar({
            isRTL: mUtil.isRTL(),
            header: {
                left: "prev,next today",
                center: "title",
                right: "month,listYear"
            },
            displayEventTime: !1,
            googleCalendarApiKey: "AIzaSyCor8XUWUYS7FcDHuzvd4-Y0evU-TY0zqo",
            events: "hypeblvd.com_33ura22e9f6knbg86f71i2ijk8@group.calendar.google.com",
            eventClick: function(e) {
                return window.open(e.url, "gcalevent", "width=700,height=600"), !1
            },
            loading: function(e) {},
            eventRender: function(e, i) {
                e.description && (i.hasClass("fc-day-grid-event") ? (i.data("content", e.description), i.data("placement", "top"), mApp.initPopover(i)) : i.hasClass("fc-time-grid-event") ? i.find(".fc-title").append('<div class="fc-description">' + e.description + "</div>") : 0 !== i.find(".fc-list-item-title").lenght && i.find(".fc-list-item-title").append('<div class="fc-description">' + e.description + "</div>"))
            }
        })
    }
};
jQuery(document).ready(function() {
    CalendarGoogle.init()
});