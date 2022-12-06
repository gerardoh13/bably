const afterFeedEnableBox = document.getElementById("afterFeedEnable")
const cutoffEnableBox = document.getElementById("cutoffEnable")

// future versions will allow the user to set custom reminders. commented code will toggle between the two options
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
    const reminderRes = await axios.post("/api/reminders", {...newReminder})
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