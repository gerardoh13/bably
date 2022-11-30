let calendarEl = document.getElementById('calendar');
let lastClicked

function eContent(info){
  if (calendar.view.type === "dayGridMonth"){
    if (!info.event._def.allDay){
      return ""
    } 
  }
}
let calendar = new FullCalendar.Calendar(calendarEl, {
  height: "auto",
  themeSystem: 'bootstrap5',
  initialView: 'dayGridMonth',
  buttonText: {
    month: 'M',
    day: 'D'
  },
  views: {
    dayGrid: {
      titleFormat: { year: 'numeric', month: 'short' },
  },
    day: {
      titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
      allDaySlot: false
    },
  },
  headerToolbar: {
    start: 'prev,next',
    center: 'title',
    end: 'dayGridMonth,timeGridDay'
  },
  slotEventOverlap: false,
  dateClick: function (info) {
    if (info.view.type == "dayGridMonth") {
      this.changeView("timeGridDay", info.dateStr);
    }
  },
  eventClick: function (info) {
    let title = info.event._def.title
    if (title.includes("bottle") || title.includes("nursing")) {
      lastClicked = info.el
      prepFeedModal(info.event._def.publicId)
    }
  },
  // dayMaxEvents: 1,
  eventContent: eContent,
  events: {
    url: '/api/events',
    display: 'list-item',
    backgroundColor: '#66bdb8',
    extraParams: {tz: Intl.DateTimeFormat().resolvedOptions().timeZone}
  },
  
});

async function prepFeedModal(id) {
  const feedRes = await axios.get(`/api/feeds/${id}`)
  let feed = feedRes.data.feed
  document.getElementById('fed_at').value = feed.datetime
  document.getElementById('evtId').value = feed.id
  document.getElementById('method').value = feed.method
  if (feed.method == "bottle") {
    document.getElementById("nursingDiv").style.display = "none"
    document.getElementById("amount").value = feed.amount
    document.getElementById("output").value = feed.amount
    document.getElementById('eventModalLabel').innerText = "Edit this bottle feed?"
  } else {
    document.getElementById("bottleDiv").style.display = "none"
    document.getElementById("duration").value = feed.duration
    document.getElementById('eventModalLabel').innerText = "Edit this nursing feed?"
  }
  $("#eventModal").modal('show')
}

$('#eventModal').on("hidden.bs.modal", () => {
  document.getElementById("feedForm").reset()
  document.getElementById("nursingDiv").style.display = ""
  document.getElementById("bottleDiv").style.display = ""
  document.getElementById('eventModalLabel').innerText = ""
  lastClicked = ""
})

$("#delEvt").on("click", async () => {
  let id = document.getElementById('evtId').value
  const delRes = await axios.delete(`/api/feeds/${id}`);
  if (delRes.data.message === "deleted") {
    lastClicked.remove()
    calendar.refetchEvents()
    $("#eventModal").modal('hide')
  }
})

$("#editEvt").on("click", async () => {
  let id = document.getElementById('evtId').value
  let method = document.getElementById('method').value
  let fed_at = (new Date(document.getElementById('fed_at').value).getTime()) / 1000
  let amount = document.getElementById("amount").value;
  let duration = document.getElementById("duration").value;
  feed = { fed_at }
  if (method === "bottle") {
    feed.amount = amount
  } else {
    feed.duration = duration
  }
  const editFeedRes = await axios.patch(`api/feeds/${id}`, { ...feed });
  if (editFeedRes.status === 200) {
    calendar.refetchEvents()
    $("#eventModal").modal('hide')
  }
})

document.addEventListener('DOMContentLoaded', function () {
  calendar.render();
});