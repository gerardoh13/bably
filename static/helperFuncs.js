const beamsClient = new PusherPushNotifications.Client({
    instanceId: "bee9563f-0b10-4988-9277-493e97d98be5",
});

function bustPhotoCache() {
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
}

document.getElementById("logout").addEventListener("click", () => {
    const beamsClient = new PusherPushNotifications.Client({
        instanceId: "bee9563f-0b10-4988-9277-493e97d98be5",
    });
    beamsClient
        .clearAllState()
        .then(() => console.log("Beams client stopped"))
        .then(() => sessionStorage.clear())
        .then(() => location.href = "/logout")
        .catch(console.error);
});

    if (location.protocol === "http:" && location.hostname !== "127.0.0.1") {
        window.location = document.URL.replace("http://", "https://")
    }
    bustPhotoCache()