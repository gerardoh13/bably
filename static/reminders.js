document.getElementById("reminderForm").addEventListener("submit", async (e) => {
    e.preventDefault()
    let dt = document.getElementById('rDateTime').value
    let msg = document.getElementById('msg').value
    console.log(dt)
    console.log(msg)
    let newReminder = {
        id: "test1",
        func: "app:test_pusher",
        trigger: "date",
        run_date: dt,
        args: [msg]

    }
    let remRes = await axios.post("/scheduler/jobs", {...newReminder})
    console.log(remRes)
})