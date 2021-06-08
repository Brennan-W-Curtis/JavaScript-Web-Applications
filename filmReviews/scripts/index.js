const reviewList = document.querySelector(".reviews");
const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const accountDetails = document.querySelector(".account-details");

const setupUI = user => {
    if (user) {
        //Display Account Information
        database.collection("users").doc(user.uid).get().then(doc => {
            const html = `
                <div>You are currently logged in as ${user.email}</div>
                <div>${doc.data().bio}</div>
            `;
            accountDetails.innerHTML = html;
        });
        //Toggle UI Elements
        loggedInLinks.forEach(item => item.style.display = "block");
        loggedOutLinks.forEach(item => item.style.display = "none");
    } else {
        //Hide Account Information
        accountDetails.innerHTML = "";
        //Toggle UI Elements
        loggedInLinks.forEach(item => item.style.display = "none");
        loggedOutLinks.forEach(item => item.style.display = "block");
    }
} 

//Setup the Reviews
const setupReviews = data => {
    if (data.length) {
        let html = "";
        data.forEach(doc => {
            const review = doc.data();
            const li = `
                <li>
                    <div class="collapsible-header grey lighten-4">${review.title}</div>
                    <div class="collapsible-body white">${review.content}</div> 
                </li>
            `;
            html += li;
        });
        reviewList.innerHTML = html;
    } else {
        reviewList.innerHTML = "<h5 class='center-align'>Login to view reviews.</h5>";
    }
    
};

//Setup Materialize Components
document.addEventListener("DOMContentLoaded", () => {
    let modals = document.querySelectorAll(".modal");
    M.Modal.init(modals);

    let items = document.querySelectorAll(".collapsible");
    M.Collapsible.init(items);
});

