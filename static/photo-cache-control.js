

document.addEventListener('DOMContentLoaded', function () {
    let date = new Date()
    let ts = date.getTime()
    let nav = document.getElementById("navBarPic")
    let profile = document.getElementById("profilePic")
    let modal = document.getElementById("modalPic")

    let photoArr = [nav, profile, modal]
    for (let photo of photoArr) {
        if (photo) {
            photo.src += `?=${ts}`
        }
    }
});