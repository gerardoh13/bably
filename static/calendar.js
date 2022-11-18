let calendarEl = document.getElementById('calendar');
let calendar = new FullCalendar.Calendar(calendarEl, {
    height: "auto",
    themeSystem: 'bootstrap5',
    initialView: 'dayGridMonth',
    buttonText: {
        month: 'M',
        day: 'D'
    },
    views: {
        dayGridMonth: {
          titleFormat: { year: 'numeric', month: 'short' }
        },
        day: {
            titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
          },
      },
    headerToolbar: {
        start: 'prev,next',
        center: 'title',
        end: 'dayGridMonth,timeGridDay'
    },
    dateClick: function(info) {
        if (info.view.type=="dayGridMonth") {
            this.changeView("timeGridDay",info.dateStr);
        }
      },
    eventClick: function(info) {
        console.log(info.event._def.publicId)
        location.href = `/feed/${info.event._def.publicId}`
    },
      events: {
        url: '/api/events',
        display: 'background'
      }
});

document.addEventListener('DOMContentLoaded', function () {
    calendar.render();
});