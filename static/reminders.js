const afterFeedEnableBox = document.getElementById("afterFeedEnable")
const cutoffEnableBox = document.getElementById("cutoffEnable")

// document.getElementById("remindAtForm").addEventListener("submit", async (e) => {
//     e.preventDefault()
//     let dt = document.getElementById('rDateTime').value
//     let msg = document.getElementById('msg').value
//     let currUser = await axios.get("/api/user")
//     let newReminder = {
//         id: "test1",
//         func: "app:test_pusher",
//         trigger: "date",
//         run_date: dt,
//         args: [msg, currUser.data]

//     }
//     console.log(newReminder)
//     let remRes = await axios.post("/scheduler/jobs", {...newReminder})
//     console.log(remRes)
// })

// radios = document.getElementsByClassName("type")
// for (let i = 0; i < radios.length; i++){
//     radios[i].addEventListener('change', () => {
//         checked = document.querySelector('input[name="type"]:checked').value
//         if (checked === "remindAt"){
//             $("#remindInForm").hide()
//             $("#remindAtForm").show()
//         } else {
//             $("#remindAtForm").hide()
//             $("#remindInForm").show()
//         }
//     })
// }

function validateTime(time) {
    let valid = true
    if (time === 0) {
        valid = false
        $('#hrsMinsFeedback').show()
    }
    return valid
}

function getDate(time) {
    let date = new Date()
    let hrs = parseInt(time.split(":")[0])
    let mins = parseInt(time.split(":")[1])
    date.setHours(hrs, mins, 0)
    return date
}

function validStartCutoff(start, cutoff) {
    let startDate = getDate(start)
    let cutoffDate = getDate(cutoff)
    let valid = startDate < cutoffDate
    console.log(valid)
    if (!valid) {
        $('#timeFeedback').show()
    }
    return valid
}
document.getElementById("remindInForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    let hours = parseInt(document.getElementById("hours").value)
    let minutes = parseInt(document.getElementById("minutes").value)
    let start = document.getElementById("start").value
    let cutoff = document.getElementById("cutoff").value
    let afterFeedEnable = afterFeedEnableBox.checked
    let afterTime = (hours * 60) + minutes
    if (afterFeedEnable) {
        if (!validateTime(afterTime) || !validStartCutoff(start, cutoff)) {
            return
        }
    }
    let cutOffEnabled = cutoffEnableBox.checked
    let newReminder = { afterFeedEnable, cutoff, start, cutOffEnabled, hours, minutes }
    console.log(newReminder)
    const reminderRes = await axios.post("/api/reminders", {...newReminder})
    console.log(reminderRes.data)
    if (reminderRes.status === 200) {
        location.href = "/"
    }
})

afterFeedEnableBox.addEventListener("change", () => {
    let hours = document.getElementById('hours')
    hours.disabled = !afterFeedEnableBox.checked
    let minutes = document.getElementById('minutes')
    minutes.disabled = !afterFeedEnableBox.checked
    document.getElementById("cutoffEnable").disabled = !afterFeedEnableBox.checked
    document.getElementById("cutoff").disabled = !afterFeedEnableBox.checked
    document.getElementById("start").disabled = !afterFeedEnableBox.checked
})

window.addEventListener('load', () => {
    let hours = document.getElementById('hours')
    hours.value = hours.dataset.value
    hours.disabled = !afterFeedEnableBox.checked
    let minutes = document.getElementById('minutes')
    minutes.value = minutes.dataset.value
    minutes.disabled = !afterFeedEnableBox.checked
    document.getElementById("cutoffEnable").disabled = !afterFeedEnableBox.checked
    document.getElementById("cutoff").disabled = !afterFeedEnableBox.checked
    document.getElementById("start").disabled = !afterFeedEnableBox.checked
});