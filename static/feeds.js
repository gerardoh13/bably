radios = document.getElementsByClassName("method")

for (let i = 0; i < radios.length; i++){
    radios[i].addEventListener('change', () => {
        checked = document.querySelector('input[name="method"]:checked').value
        console.log(checked)
        if (checked == "nursing"){
            $(".bottleDiv").hide()
            $(".nursingDiv").show()

        } else {
            $(".nursingDiv").hide()
            $(".bottleDiv").show()
        }
    })
}

document.getElementById('feedForm').addEventListener("submit", async (e) => {
    e.preventDefault()
    method = document.querySelector('input[name="method"]:checked').value
    let fed_at = new Date(document.getElementById('fed_at').value).getTime()
    if (method == "bottle"){
        let amount = parseFloat(document.getElementById("amount").value)
        newFeed = {fed_at, amount, method}
    } else {
        return
    }
    console.log(newFeed)
    const newFeedRes = await axios.post("/feeds", {...newFeed})
    if (newFeedRes.status === 201){
        location.href = "/"
    }
})

window.addEventListener('load', () => {
    let now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      now.setMilliseconds(null)
    now.setSeconds(null)
    document.getElementById('fed_at').value = now.toISOString().slice(0, -1);
  });