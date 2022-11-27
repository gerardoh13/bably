function getMilestones(months, gender) {
    let age
    if (months <= 12){
        let counts = [0, 2, 4, 6, 9, 12]
        goal = months;
        age = counts.reduce(function (prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
    }

    if (gender === "male") {
        pronoun = "him"
        possPronoun = "his"
        subject = "he"
        reflexive = "himself"
    } else {
        pronoun = "her"
        possPronoun = "her"
        subject = "she"
        reflexive = "herself"

    }
    switch (age) {
        case 0:
            return `
    <div class="text-center">
    <h2>Welcome baby! </h2>
    <h3>We're excited to watch you grow!</h3>
    <p>On this page you'll find milestones to look forward to starting at the age of 2 months, so stay tuned!</p>
    <p>In the meantime, your parents should consult with your pediatrician if they have any questions about your growth and development.</p>
    </div>
    `
        case 2:
            return `
    <h3>Milestones at this age:</h3>
    <h4>Social/Emotional</h4>
    <ul>
        <li>Calms down when spoken to or picked up</li>
        <li>Looks at your face</li>
        <li>Seems happy to see you when you walk up to ${pronoun}</li>
        <li>Smiles when you talk to or smile at ${pronoun}</li>
    </ul>
    <h4>Language/Communication</h4>
    <ul>
        <li>Makes sounds other than crying</li>
        <li>Reacts to loud sounds</li>
    </ul>
    <h4>Cognitive Milestones</h4>
    <ul>
        <li>Watches you as you move</li>
        <li>Looks at a toy for several seconds</li>
    </ul>
    <h4>Movement/Physical</h4>
    <ul>
        <li>Holds head up when on tummy</li>
        <li>Moves both arms and both legs</li>
        <li>Opens hands briefly</li>
    </ul>
    `
        case 4:
            return `
    <h3>Milestones at this age:</h3>
    <h4>Social/Emotional</h4>
    <ul>
        <li>Smiles on ${possPronoun} own to get your attention</li>
        <li>Chuckles (not yet a full laugh) when you try to make ${pronoun} laugh</li>
        <li>Looks at you, moves, or makes sounds to get or keep your attention</li>
    </ul>
    <h4>Language/Communication</h4>
    <ul>
        <li>Makes sounds like “oooo”, “aahh” (cooing)</li>
        <li>Makes sounds back when you talk to ${pronoun}</li>
        <li>Turns head towards the sound of your voice</li>
    </ul>
    <h4>Cognitive Milestones</h4>
    <ul>
        <li>If hungry, opens mouth when ${subject} sees breast or bottle</li>
        <li>Looks at ${possPronoun} hands with interest</li>
    </ul>
    <h4>Movement/Physical</h4>
    <ul>
        <li>Holds head steady without support when you are holding ${pronoun}</li>
        <li>Holds a toy when you put it in ${possPronoun} hand</li>
        <li>Uses ${pronoun} arm to swing at toys</li>
        <li>Brings hands to mouth</li>
        <li>Pushes up onto elbows/forearms when on tummy</li>
    </ul>
    `
        case 6:
            return `
    <h3>Milestones at this age:</h3>
    <h4>Social/Emotional</h4>
    <ul>
        <li>Knows familiar people</li>
        <li>Likes to look at self in a mirror</li>
        <li>Laughs</li>
    </ul>
    <h4>Language/Communication</h4>
    <ul>
        <li>Takes turns making sounds with you</li>
        <li>Blows “raspberries” (sticks tongue out and blows)</li>
        <li>Makes squealing noises</li>
    </ul>
    <h4>Cognitive Milestones</h4>
    <ul>
        <li>Puts things in ${possPronoun} mouth to explore them</li>
        <li>Reaches to grab a toy ${subject} wants</li>
        <li>Closes lips to show ${subject} doesn’t want more food</li>
    </ul>
    <h4>Movement/Physical</h4>
    <ul>
        <li>Rolls from tummy to back</li>
        <li>Pushes up with straight arms when on tummy</li>
        <li>Leans on hands to support ${reflexive} when sitting</li>
    </ul>
    `
        case 9:
            return `
    <h3>Milestones at this age:</h3>
    <h4>Social/Emotional</h4>
    <ul>
        <li>Is shy, clingy, or fearful around strangers</li>
        <li>Shows several facial expressions, like happy, sad, angry, and surprised</li>
        <li>Looks when you call ${pronoun} name</li>
        <li>Reacts when you leave (looks, reaches for you, or cries)</li>
        <li>Smiles or laughs when you play peek-a-boo</li>
    </ul>
    <h4>Language/Communication</h4>
    <ul>
        <li>Makes a lot of different sounds like “mamamama” and “bababababa”</li>
        <li>Lifts arms up to be picked up</li>
    </ul>
    <h4>Cognitive Milestones</h4>
    <ul>
        <li>Looks for objects when dropped out of sight (like ${possPronoun} spoon or toy)</li>
        <li>Bangs two things together</li>
    </ul>
    <h4>Movement/Physical</h4>
    <ul>
        <li>Gets to a sitting position by ${reflexive}</li>
        <li>Moves things from one hand to ${possPronoun} other hand</li>
        <li>Uses fingers to “rake” food towards ${reflexive}</li>
        <li>Sits without support</li>
    </ul>
    `
        case 12:
            return `
    <h3>Milestones at this age:</h3>
    <h4>Social/Emotional</h4>
    <ul>
        <li>Plays games with you, like pat-a-cake</li>
    </ul>
    <h4>Language/Communication</h4>
    <ul>
        <li>Waves “bye-bye”</li>
        <li>Calls a parent “mama” or “dada” or another special name</li>
        <li>Understands “no” (pauses briefly or stops when you say it)</li>
    </ul>
    <h4>Cognitive Milestones</h4>
    <ul>
        <li>Puts something in a container, like a block in a cup</li>
        <li>Looks for things ${subject} sees you hide, like a toy under a blanket</li>
    </ul>
    <h4>Movement/Physical</h4>
    <ul>
        <li>Pulls up to stand</li>
        <li>Walks, holding on to furniture</li>
        <li>Drinks from a cup without a lid, as you hold it</li>
        <li>Picks things up between thumb and pointer finger, like small bits of food</li>
    </ul>
    `
        default:
            return `
    <div class="text-center">
    <h2>Thank you for Using Bably! </h2>
    <p>Bably milestones are intended for ages 0 to 12 months but feel free to stick around.</p>
    <p>Your parents should continue to check with your pediatrician for any questions regarding your growth.</p>
    <h3>We can't wait to see what you'll accomplish!</h3>
    </div>
    `
    }
}

document.getElementById("profileForm").addEventListener('submit', async (e) => {
    e.preventDefault()
    let first_name = document.getElementById("cFirstName").value.trim()
    let gender = document.querySelector('input[name="gender"]:checked').value;
    let dob = document.getElementById("dob").value
    let public_id = document.getElementById('public_id').value
    let updatedIndant = { first_name, gender, dob }
    if (public_id) {
        updatedIndant.public_id = public_id
    }
    console.log(updatedIndant)
    const newChildRes = await axios.patch("/api/infants", { ...updatedIndant });
    if (newChildRes.status === 200) {
        location.reload()
    }
})

let fileForm = document.getElementById('fileForm')
if (fileForm) {
    fileForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        let fileInput = document.getElementById('formFile')
        const formData = new FormData();
        formData.append('file', fileInput.files[0])
        document.getElementById("uploadBtn").innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...`
        let uploadRes = await axios.post("/upload", formData)
        if (uploadRes.status === 200) {
            let public_id = uploadRes.data.public_id
            let imgSrc = uploadRes.data.secure_url
            document.getElementById('babyPhoto').setAttribute("src", imgSrc)
            document.getElementById('public_id').value = public_id
            $('#uploadForm').hide()
            $('#uploadSuccess').show()
        } else {
            console.log("oops! something went wrong")
            $('#uploadForm').show()
            $('#uploadSuccess').hide()
        }
    })
}

window.addEventListener('load', () => {
    let months = document.getElementById('age').dataset.months
    let gender = document.getElementById('age').dataset.gender
    document.getElementById("milestones").innerHTML = getMilestones(months, gender)
    let dob = document.getElementById('dob')
    let max = new Date().toISOString().slice(0, -14)
    let event = new Date();
    let twoYearsAgo = parseInt(event.getFullYear()) - 2
    event.setFullYear(twoYearsAgo);
    min = event.toISOString().slice(0, -14)
    dob.setAttribute('max', max)
    dob.setAttribute('min', min)
});