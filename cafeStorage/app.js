const cafeList = document.querySelector("#cafe-list");
const cafeForm = document.querySelector("#add-cafe-form");

//Create Element and Render Cafe
function renderCafe(doc) {
    let li = document.createElement("li");
    let name = document.createElement("span");
    let city = document.createElement("span");
    let cross = document.createElement("div");

    li.setAttribute("data-id", doc.id);
    name.textContent = doc.data().name;
    city.textContent = doc.data().city;
    cross.textContent = "x";

    li.appendChild(name);
    li.appendChild(city);
    li.appendChild(cross);

    cafeList.appendChild(li);

    //Deleting Data
    cross.addEventListener("click", event => {
        event.stopPropagation()
        let id = event.target.parentElement.getAttribute("data-id");
        database.collection("cafes").doc(id).delete();
    })
} 

//Getting Data
const database = firebase.firestore();
database.settings({ timestampsInSnapshots: true });

//database.collection("cafes").orderBy("name").get().then(snapshot => {
//    snapshot.docs.forEach(doc => {
//        renderCafe(doc);
//    })
//})

//Saving Data
cafeForm.addEventListener("submit", event => {
    event.preventDefault();
    database.collection("cafes").add({
        name: cafeForm.name.value,
        city: cafeForm.city.value
    });
    cafeForm.name.value = "";
    cafeForm.city.value = "";
});

//Real-Time Listener
database.collection("cafes").orderBy("city").onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if (change.type == "added") {
            renderCafe(change.doc);
            console.log(change.doc.data())
        } else if (change.type == "removed") {
            let li = cafeList.querySelector(`[data-id=${change.doc.id}]`);
            cafeList.removeChild(li);
        }
    })
})