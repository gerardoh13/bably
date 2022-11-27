// register user for all notifications
const beamsClient = new PusherPushNotifications.Client({
  instanceId: "bee9563f-0b10-4988-9277-493e97d98be5",
});
// beamsClient
//   .start()
//   .then(() => beamsClient.addDeviceInterest("hello"))
//   .then(() => console.log("Successfully registered and subscribed!"))
//   .catch(console.error);

document.getElementById("logout").addEventListener("click", () => {
  console.log("log out");
  beamsClient
    .clearAllState()
    .then(() => console.log("Beams client stopped"))
    .catch(console.error);
});

window.addEventListener('load', async () => {
let currUserRes = await axios.get("/api/user")
let currUser = currUserRes.data
const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
    url: "/pusher/beams-auth",
  });
  
  beamsClient
    .start()
    .then(() => beamsClient.setUserId(currUser, beamsTokenProvider))
    .then(() => console.log('success'))
    .catch(console.error)
});
