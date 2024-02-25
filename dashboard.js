function openModal(modal){
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}
function closeModal(modal){
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}
const open_post_modal_button = document.getElementById('post_modal_button')
open_post_modal_button.addEventListener('click', () => {
    //document.getElementById("createPostModal_body_fileInput").value = null
    openModal(createPostModal)
})
const close_post_modal_button = document.getElementById('createPostModal_header_closeButton')
close_post_modal_button.addEventListener('click', () => {
    closeModal(createPostModal)
})

const open_settings_modal_button = document.getElementById('settings_modal_button')
open_settings_modal_button.addEventListener('click', () => {
    auto_populate_settings()
    openModal(settingsModal)
})
const close_close_modal_button = document.getElementById('settingsModal_header_closeButton')
close_close_modal_button.addEventListener('click', () => {
    closeModal(settingsModal)
})

const overlay = document.getElementById('overlay')
overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
        closeModal(modal)
    })
})

//Imports needed modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js';
import { getDatabase, ref as ref_database, get, set, child, update } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js';
import { getStorage, ref as ref_storage, getDownloadURL, uploadBytes } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js'
//Connects to Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCzLcD82RAxaptD4VfpRW2pshlQgX_FvMw",
    authDomain: "swimchat-8d634.firebaseapp.com",
    databaseURL: "https://swimchat-8d634-default-rtdb.firebaseio.com",
    projectId: "swimchat-8d634",
    storageBucket: "swimchat-8d634.appspot.com",
    messagingSenderId: "49158591781",
    appId: "1:49158591781:web:78c29ebcea31315a6636cc",
    measurementId: "G-11FCRKVE3D"
};
//Gets database refrences
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref_database(getDatabase());
//Gets storage refrences
const stor = getStorage()
const storageRef = ref_storage(getStorage(), 'images');

const username = localStorage.getItem('User');
const userID = localStorage.getItem('UID');

function auto_populate_settings() {
    //Gets the user information from local storage
    const UID = localStorage.getItem('UID');
    //Gets all current user settings and displays them on the screen
    get(child(dbRef, 'users/' + UID)).then((snapshot) => {
        //Gets the users setting values
        const username = snapshot.val().username;
        const email = snapshot.val().email;
        const password = snapshot.val().password;
        const bio = snapshot.val().bio;
        const isPrivate = snapshot.val().isPrivate;
        const accountType = snapshot.val().accountType;
        //Displays them to HTML
        document.getElementById("settingsModal_body_usernameInput").value = username;
        document.getElementById("settingsModal_body_emailInput").value = email;
        document.getElementById("settingsModal_body_passwordInput").value = password;
        document.getElementById("settingsModal_body_bioInput").value = bio;
        document.getElementById("settingsModal_body_isPrivateBox").checked = isPrivate;
        if (accountType == "swimmer"){
            document.getElementById("settingsModal_body_accountDrodown").value = "swimmer";
        } else if (accountType == "coach"){
            document.getElementById("settingsModal_body_accountDrodown").value = "coach";
        } else {
            document.getElementById("settingsModal_body_accountDrodown").value = "team";
        }
    });
}

function displayPost(author, date, img, caption) {
    const postContainer = document.getElementById("post_container");

    //Creates a div with a class of post
    const post = document.createElement("div")
    post.classList.add("post");

    const authorh3 = document.createElement("h3")
    authorh3.classList.add("post_author")
    authorh3.innerHTML  = author
    post.appendChild(authorh3)

    const dateh3 = document.createElement("h3")
    dateh3.classList.add("post_date")
    dateh3.innerHTML  = date
    post.appendChild(dateh3)

    const imgimg = document.createElement("img")
    imgimg.classList.add("post_img")
    getDownloadURL(ref_storage(stor, img)).then((url) => {
        imgimg.setAttribute('src', url);
    })
    post.appendChild(imgimg)

    const captionp = document.createElement("p")
    captionp.classList.add("caption")
    captionp.innerHTML  = caption
    post.appendChild(captionp)

    //Adds post to the post container
    postContainer.appendChild(post);
}

function get_posts(){
    const postContainer = document.getElementById("post_container");
    postContainer.innerHTML = ''
    get(child(dbRef, '/posts')).then((snapshot) => {
        const posts = snapshot.val()
        const list_of_posts = Object.keys(posts)
        for (let i = list_of_posts.length-1; i >= 0; i--) {
            displayPost(posts[list_of_posts[i]].author, posts[list_of_posts[i]].date, posts[list_of_posts[i]].postID, posts[list_of_posts[i]].caption)
        }
    })
}

createPostModal_body_submitButton.onclick = function createPost(){
    //Gets post name
    get(child(dbRef, '/dataBaseInfo/createdPosts')).then((snapshot) => {
        var new_total = snapshot.val() + 1;
        var date = new Date();
        var post_id = (1000 + new_total) + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + (date.getFullYear()).toString().substr(-2) +  + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

        //Gets caption
        const postCaption = document.getElementById("createPostModal_body_captionInput").value;
        document.getElementById("createPostModal_body_captionInput").value = null
        //Gets image
        let inputFile = document.getElementById("createPostModal_body_fileInput")
        const imageRefrence = ref_storage(stor, post_id)

        set(ref_database(db, 'posts/' + post_id), {
            postID: post_id,
            author: username,
            date: ((date.getMonth()+1) + "/" + (date.getDate()) + "/"  + (date.getFullYear())),
            caption: postCaption
        }).then(uploadBytes(imageRefrence, inputFile.files[0]).then((snapshot) => {
            console.log('Uploaded complete');
        }))
        update(ref_database(db, 'dataBaseInfo'), {
            createdPosts: new_total
        })
    }).then(get_posts())
    closeModal(createPostModal)
}

settingsModal_body_submitButton.onclick = function updateSettings(){
    const UID = localStorage.getItem('UID');
    const user = localStorage.getItem('User');

    const newUsername = document.getElementById('settingsModal_body_usernameInput').value;
    const newEmail = document.getElementById('settingsModal_body_emailInput').value;
    const newPassword = document.getElementById('settingsModal_body_passwordInput').value;

    if (newUsername != user) {
        var is_name_valid = true;
        var invalid_characters = ".#$[] "
        for (let i = 0; i < invalid_characters.length; i++){
            if (username.includes(invalid_characters[i])){
                is_name_valid = false;
                window.alert("Account Username must not contain '.','#','$','[', or ']'")
            }
        get(child(dbRef, 'user_reference/' + newUsername)).then((snapshot) => {
            if ((snapshot.exists()) && (newUsername != user)) {
                is_name_valid = false;
                window.alert("Account Username Already Exists")
            }
        })}

        if (is_name_valid = true) {
            set(ref_database(db, 'user_reference/' + newUsername), {
                UID: UID
            }).then(update((ref_database(db, 'user_reference')), {
                [user]: null
            }))

            const newAccounType = document.getElementById('settingsModal_body_accountDrodown').value;
            const newBio = document.getElementById('settingsModal_body_bioInput').value;
            const newIsPrivate = document.getElementById('settingsModal_body_isPrivateBox').checked;
            const newPfp = document.getElementById("settingsModal_body_pfpInput");
            const imageRefrence = ref_storage(stor, newUsername + "-pfp");

            update(ref_database(db, 'users/' + UID), {
                username: newUsername,
                accountType: newAccounType,
                bio: newBio,
                isPrivate: newIsPrivate,
            }).then(uploadBytes(imageRefrence, newPfp.files[0]).then((snapshot) => {
                console.log('Uploaded complete');
            }))
            if (newEmail.includes("@")){
                update(ref_database(db, 'users/' + UID), {
                    email: newEmail})
            } else {
                window.alert("Email is invalid.")}
            if (newPassword != "") {
                update(ref_database(db, 'users/' + UID), {
                    password: newPassword
                })} else {
                window.alert("Please choose a stronger password.")
            }
            localStorage.setItem("User", newUsername);
            localStorage.setItem("Pass", newPassword);
        }
    } else {
        const newAccounType = document.getElementById('settingsModal_body_accountDrodown').value;
        const newBio = document.getElementById('settingsModal_body_bioInput').value;
        const newIsPrivate = document.getElementById('settingsModal_body_isPrivateBox').checked;
        const newPfp = document.getElementById("settingsModal_body_pfpInput");
        const imageRefrence = ref_storage(stor, newUsername + "-pfp");

        update(ref_database(db, 'users/' + UID), {
            accountType: newAccounType,
            bio: newBio,
            isPrivate: newIsPrivate,
        }).then(uploadBytes(imageRefrence, newPfp.files[0]).then((snapshot) => {
            console.log('Uploaded complete');
        }))
        if (newEmail.includes("@")){
            update(ref_database(db, 'users/' + UID), {
                email: newEmail})
        } else {
            window.alert("Email is invalid.")}
        if (newPassword != "") {
            update(ref_database(db, 'users/' + UID), {
                password: newPassword
            })} else {
            window.alert("Please choose a stronger password.")
        }
        localStorage.setItem("User", newUsername);
        localStorage.setItem("Pass", newPassword);
    }
    closeModal(settingsModal)
}

get_posts()

const feed_title = document.getElementById("feed_title");
feed_title.innerHTML = "Hey " + username + ", Here is Your Feed!"