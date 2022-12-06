let table = document.getElementById('table')

function toDateStr (timestamp) {
    let value = timestamp * 1000
    let toDate = new Date(value)
    let date = toDate.toLocaleDateString()
    let time = toDate.toLocaleString([], {hour: '2-digit', minute:'2-digit'})
    return`${date} ${time}`
}

function createRow(feed, hidden) {
        let tr = document.createElement("tr")
        if (hidden){
            tr.classList.add("hidden")
            tr.style.display = "none"
        }
        let dt = toDateStr(feed.fed_at)
            tr.innerHTML = `
            <td>${dt}</td>
            <td>${feed.method}</td>
            ${feed.method === "bottle" ? `<td>${feed.amount} oz</td>` : `<td>${feed.duration} mins</td>`}
            `
        return tr
}


function createMoreRows(feeds){
    let showMore = document.createElement("tr")
    showMore.id = "showMore"
    showMore.innerHTML = `
    <th scope="row">+ ${feeds.length} more</th>
    <td></td>
    <td></td>
    `
    table.append(showMore)
    showMore.addEventListener("click", onShowMore)
    for (let feed of feeds){
        let row = createRow(feed, true)
        table.append(row)
    }
    let hideMore = document.createElement("tr")
    hideMore.id = "hideMore"
    hideMore.classList.add("hidden")
    hideMore.style.display = "none"
    hideMore.innerHTML = `
    <th scope="row">Hide</th>
    <td></td>
    <td></td>
    `
    table.append(hideMore)
    hideMore.addEventListener("click", onHideMore)
    
}
document.addEventListener('DOMContentLoaded', async () => {
    startBeams()
    let midnight = new Date()
    midnight.setHours(0,0,0,0)
    let last_midnight = midnight.getTime() / 1000
    midnight.setDate(midnight.getDate() + 1)
    let next_midnight = midnight.getTime() / 1000
    const feedsRes = await axios.get(`/api/feeds/${last_midnight}/${next_midnight}`)
    if (feedsRes.data.feeds.length > 0){
        $("#feeds").show()
        document.getElementById("bottleCount").innerText = `${feedsRes.data.total_oz} oz`
        document.getElementById("nursingCount").innerText = feedsRes.data.nursing_count
        for (let feed of feedsRes.data.feeds){
            let row = createRow(feed, false)
            table.append(row)
        }
        if (feedsRes.data.more_feeds.length > 0){
            createMoreRows(feedsRes.data.more_feeds)
        }
    } else {
        $("#noFeeds").show()
    }

})


function onShowMore() {
$('#showMore').hide()
let hiddenRows = document.getElementsByClassName("hidden")
for (let row of [...hiddenRows]){
  row.style.display = ""
}
$('#moreDiv').show()
}


function onHideMore () {
  $('#showMore').show()
let hiddenRows = document.getElementsByClassName("hidden")
for (let row of [...hiddenRows]){
  row.style.display = "none"
}
$('#moreDiv').show()
}

async function startBeams() {
    let currUserRes = await axios.get("/api/user")
    let currUser = currUserRes.data
    if (currUser === "N/A") {
        return
    }
    if (sessionStorage.getItem("currUser") !== currUser) {
        const beamsClient = new PusherPushNotifications.Client({
            instanceId: "bee9563f-0b10-4988-9277-493e97d98be5",
        });
        const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
            url: "/pusher/beams-auth",
        });
        beamsClient
            .start()
            .then(() => beamsClient.setUserId(currUser, beamsTokenProvider))
            .then(() => console.log('success'))
            .catch(console.error)
        sessionStorage.setItem("currUser", currUser)
    }
}