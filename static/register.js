const CLOUDINARY_API = "https://api.cloudinary.com/v1_1/${dolnu62zm}/upload"

let currentTab = 0;
showTab(currentTab);

function showTab(n) {
    let x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
        document.getElementById("name").innerText = document.getElementById("cFirstName").value.trim()
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    fixStepIndicator(n)
}

function nextPrev(n) {
    let x = document.getElementsByClassName("tab");
    if (n == 1 && !validateForm()) return false;
    x[currentTab].style.display = "none";
    currentTab = currentTab + n;
    if (currentTab >= x.length) {
        submitChildReg()
        return false;
    }
    showTab(currentTab);
}

function validateForm() {
    let x, y, i, valid = true;
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");
    r = x[currentTab].getElementsByClassName("gender")
    for (i = 0; i < y.length; i++) {
        if (y[i].type !== "file" && y[i].type !== "hidden") {
            if (y[i].value.trim() == "") {
                y[i].value = ""
                x[currentTab].classList.add("was-validated")
                valid = false;
            }
        }
    }
    if (r.length > 0) {
        if (!(r[0].checked || r[1].checked)) {
            valid = false;
        }
    }
    if (valid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid;
}

function fixStepIndicator(n) {
    let i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
}

async function submitChildReg() {
    let first_name = document.getElementById("cFirstName").value.trim()
    let gender = document.querySelector('input[name="gender"]:checked').value;
    let dob = document.getElementById("dob").value
    let public_id = document.getElementById('public_id').value
    let newInfant = {first_name, gender, dob}
    if (public_id) {
        newInfant.public_id = public_id
    }
    const newChildRes = await axios.post("/api/infants", {...newInfant});
    if (newChildRes.status === 201) {
        location.href = "/"
    }
}

document.getElementById('fileForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    let fileInput = document.getElementById('formFile')
    const formData = new FormData();
    formData.append('file', fileInput.files[0])
    document.getElementById("uploadBtn").innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...`
    let uploadRes = await axios.post("/upload", formData)
    if (uploadRes.status === 200) {
        let public_id = uploadRes.data.public_id
        let imgSrc = uploadRes.data.secure_url
        document.getElementById('babyPic').setAttribute("src", imgSrc)
        document.getElementById('public_id').value = public_id
        document.getElementById("picName").innerText = `Looking good, ${document.getElementById("cFirstName").value.trim()}!`
        $('#uploadForm').hide()
        $('#uploadSuccess').show()
    } else {
        console.log("oops! something went wrong")
        $('#uploadForm').show()
        $('#uploadSuccess').hide()
    }
})

window.addEventListener('load', () => {
    let dob = document.getElementById('dob')
    let max = new Date().toISOString().slice(0, -14)
    let event = new Date();
    let twoYearsAgo = parseInt(event.getFullYear()) - 2
    event.setFullYear(twoYearsAgo);
    min = event.toISOString().slice(0, -14)
    dob.setAttribute('max', max)
    dob.setAttribute('min', min)
});