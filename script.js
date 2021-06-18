const audioContent = document.getElementById('audioContent');
const audioButton = document.getElementById('audioButton');
const audioPlayer = document.getElementById('audio');
const displayTitle = document.getElementById('displayTitle');

let audioURL = 'https://archive.org/embed/gd1977-12-30.sbd.cribbs.30624.sbeok.shnf&output=json';
// https://archive.org/search.php?query=grateful+dead+1977&and%5B%5D=mediatype%3A%22etree%22&and%5B%5D=year%3A%221977%22&sort=date&output=json
let showQueryURL = 'https://archive.org/advancedsearch.php?q=%28grateful%20dead%29%20AND%20date%3A%5B1972-01-01%20TO%201972-12-31%5D&sort=date&rows=100&output=json';
//let data = '';
let songArray = [];

// Query Notes: use 'identifier' to add to fetch query- this will retrieve exact show (see fetch above, after "embed")
// console.log(data.response.docs[60].identifier)
// console.log(data.response.docs[60].title)
// console.log(data.response.docs[60].description)
// Get Year: console.log(data.response.docs[60].date.slice(0,4))
//Get Month: console.log(data.response.docs[60].date.slice(5,7))
// Get Day: console.log(data.response.docs[60].date.slice(8,10))



 

// Last known working function before copy out to fetchShows.js
// async function getShows() {
//     const response = await fetch(showQueryURL);
//     data = await response.json();
//     console.log(data);
// }


async function getAudio () {
    const response = await fetch(audioURL);
    data = await response.json();  
    console.log(data); 
    createPlaylist(data);
}

audioButton.addEventListener('click', getAudio);

//getShows();