//Listen for Auth State Changes
auth.onAuthStateChanged(user => {
    if (user) {
        //Get Data
        database.collection("reviews").onSnapshot(snapshot => {
            setupReviews(snapshot.docs);
            setupUI(user);
        }, error => {
            console.log(error.message);
        });
    } else {
        setupUI();
        setupReviews([]);
    }
})

//Create New Review
const createForm = document.querySelector("#create-form");
createForm.addEventListener("submit", event => {
    event.preventDefault();
    database.collection("reviews").add({
        title: createForm["title"].value,
        content: createForm["content"].value
    }).then(() => {
        //Close Modal and Reset Form
        const modal = document.querySelector("#modal-create");
        M.Modal.getInstance(modal).close();
        createForm.reset();
    }).catch(error => {
        console.log(error.message);
    })
});

//Signup Modal
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", event => {
    event.preventDefault();

    //Get User Information
    const email = signupForm["signup-email"].value;
    const password = signupForm["signup-password"].value;

    //Signup the User
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        return database.collection("users").doc(cred.user.uid).set({
            bio: signupForm["signup-bio"].value
        });
    }).then(() => {
        const modal = document.querySelector("#modal-signup");
        M.Modal.getInstance(modal).close();
        signupForm.reset();
        signupForm.querySelector(".error").innerHTML = "";
    }).catch(error => {
        signupForm.querySelector(".error").innerHTML = error.message;
    });
});

//Logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", event => {
    event.preventDefault();
    auth.signOut()
});

//Login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", event => {
    event.preventDefault();

    //Get User Information
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {

        //Close Login Modal and Reset Form
        const modal = document.querySelector("#modal-login");
        M.Modal.getInstance(modal).close();
        loginForm.reset();
        loginForm.querySelector(".error").innerHTML = "";
    }).catch(error => {
        loginForm.querySelector(".error").innerHTML = error.message;
    });
});