let showMore = document.getElementById("showMore")
if (showMore){
  showMore.addEventListener('click', () => {
$('#showMore').hide()
let hiddenRows = document.getElementsByClassName("hidden")
for (let row of [...hiddenRows]){
  row.style.display = ""
}
$('#moreDiv').show()
})
}

let hideMore = document.getElementById("hideMore")
if (hideMore) {
  hideMore.addEventListener('click', () => {
  $('#showMore').show()
let hiddenRows = document.getElementsByClassName("hidden")
for (let row of [...hiddenRows]){
  row.style.display = "none"
}
$('#moreDiv').show()
})
}

let timestamps = document.getElementsByClassName('timestamp')
for (let ts of timestamps){
    let value = parseInt(ts.dataset.date) * 1000
    let toDate = new Date(value)
    let date = toDate.toLocaleDateString()
    let time = toDate.toLocaleString([], {hour: '2-digit', minute:'2-digit'})
    ts.innerHTML = `${date} ${time}`
}