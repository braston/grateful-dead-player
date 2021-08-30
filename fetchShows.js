const showsURL1 = 'https://archive.org/advancedsearch.php?q=grateful%20dead%20AND%20creator:grateful%20dead%20AND%20year:';
const showsURL2 = '%20AND%20creator:grateful%20dead&fl%5B%5D=identifier,title,year,date,creator,source&and%5B%5D=mediatype%3A%22etree%22&rows=1000&output=json&sort%5B%5D=date+asc';
let audioEmbed = 'https://archive.org/embed/';

// TO DO:
// Hover over source, update setlist
// fix scrolling on spacebar
// Display loading animation
// Back / FW buttons
// 1- Click on show title to bring browser back, in same state (is this possible) 
// 3 - Audio controls (back, forward). End of song, doesn't move to next
// 2- Mobile response
// 3 BUG- if rapidly changing songs, DOM exception- play() request interrupted by new load. Creates 'load lock', takes several seconds to recover. Solve by disabling song buttons until playing
const audioContent = document.getElementById('audioContent');
const audioContainer = document.getElementById('audio-container');
const audioPlayer = document.getElementById('audio');
const displayTitle = document.getElementById('displayTitle');
let sideBarYear = document.getElementById('sideBarYear');
let sideBarDate = document.getElementById('sideBarDate');
let sideBarShow = document.getElementById('sideBarShow');
let sideBarSetlist = document.getElementById('sideBarSetlist');
let sideBarLoadedSongs = document.getElementById('sideBarLoadedSongs');
let toggleIcon = document.getElementById('menuToggle');
let loader = document.getElementById('loader');
let audioForward = document.getElementById('audioFW');
let audioBackward = document.getElementById('audioBW');
let audioToggleButton = document.getElementById('audioToggleButton');
let songToggleButton = document.getElementById('songDisplayToggle');

let year = undefined;
// shows structurs: [year[date[source]]]
let shows = [[]];
let last_year = '';
let last_date = '';
let year_counter = 0;
let date_counter = 0;
let source_counter = 0;
let first = true;
let data = '';
let showList = [];
let songIndex = 0;
let navListeners = [];
let showTitle = '';
let sourceTitle = '';
let setlist = [];
let sourceList = [];
let hidden = false;
let songDisplayVisible = false;

function toggleLoadingSpinner(){
    loader.hidden = !loader.hidden;
}

function songDisplayAnimation () {
   // songDisplayVisible ? sideBarLoadedSongs.classList.replace(`slide-in`, 'slide-out') : sideBarLoadedSongs.classList.replace(`slide-out`, 'slide-in');
  //  songDisplayVisible = !songDisplayVisible;
    
}

// Controls Behavior of Menu Icon
function menuIcon(x) {
    x.classList.toggle("change");
    hidden ? sideBarYear.classList.replace('sideBar-hidden','sideBar-Year') : sideBarYear.classList.replace('sideBar-Year', 'sideBar-hidden');
    hidden ? null:sideBarDate.classList.replace('sideBar-Date', 'sideBar-hidden');
    hidden ? null:sideBarShow.classList.replace('sideBar-Show', 'sideBar-hidden');
    hidden ? null:sideBarSetlist.classList.replace('sideBar-Setlist', 'sideBar-hidden');
    hidden = !hidden;
  }

// Hides All Sidebars
function hideMenu() {
    toggleIcon.classList.toggle("change");
    hidden = !hidden;
    sideBarYear.classList.replace('sideBar-Year', 'sideBar-hidden');
    sideBarDate.classList.replace('sideBar-Date', 'sideBar-hidden');
    sideBarShow.classList.replace('sideBar-Show', 'sideBar-hidden');
    sideBarSetlist.classList.replace('sideBar-Setlist', 'sideBar-hidden');
}

// Shows All Sidebars
function showMenu() {
    toggleIcon.classList.toggle("change");
    hidden = !hidden;
    sideBarYear.classList.replace('sideBar-hidden', 'sideBar-Year');
    sideBarDate.classList.replace('sideBar-hidden', 'sideBar-Date');
    sideBarShow.classList.replace('sideBar-hidden', 'sideBar-Show');
    sideBarSetlist.classList.replace('sideBar-hidden', 'sideBar-Setlist');
}

// Toggles Visibility of 'Year' Selection
function toggleMenu(type){
    if (type == 'Date'){
        sideBarDate.classList.replace('sideBar-hidden',`sideBar-${type}`)
    }
    else{
        sideBarShow.classList.replace('sideBar-hidden',`sideBar-${type}`)   
    }
}

function playSong (song){
    let source = song.getAttribute('src');
    audioPlayer.src = source;
    displayTitle.innerHTML = `Now Playing: ${song.textContent} <div class='displayText'>-${showTitle}<br>-${sourceTitle}</div>`;
    displayTitle.removeAttribute('hidden');
    songIndex = song.getAttribute('id').toString().slice(4,6);
    audioToggleButton.innerHTML = 'Pause';
    audioPlayer.play();
}

 function createPlaylist (data){ 
    sourceList = [];
    audioContent.textContent = '';  
    sideBarLoadedSongs.textContent = '';  
    data.forEach((item, i) => {
        let song = `${item.title}`;
     //    Create new HTML element for every song
        const newElement = document.createElement('div');
        newElement.textContent = song;
        newElement.classList.add('song');
        newElement.id = `song${i}`;
        let songURL = `https://archive.org${item.sources[0].file}`;
        sourceList.push(songURL);
        newElement.setAttribute('src', songURL);
        audioContent.appendChild(newElement);
        songArray[i] = document.getElementById(`song${i}`);
        audioContainer.classList.remove('container-item-hidden');
        audioContainer.classList.add('container-item');
        ///////////////////////////////////////
        sideBarLoadedSongs.appendChild(newElement);
        //////////////////////////////////////
    })
 
 //    Add event listener for each loaded song
    songArray.forEach(song => {
        song.addEventListener('click', function(){
            playSong(song);
        });
    })
    hideMenu();
    sideBarLoadedSongs.classList.replace('sideBar-hidden', 'sideBar-LoadedSongs');
    // Auto Start Show
    playSong(songArray[0]);
    audioToggleButton.innerHTML = 'Pause';
 };

async function loadShow (event) {
    showTitle = '';
    sourceTitle = '';
    showURL = `${audioEmbed}${event.target.id}&output=json`;
    const response = await fetch(showURL, {mode: 'cors'});
    data = await response.json();  
    showTitle = event.target.title;
    sourceTitle = event.target.innerHTML;
    createPlaylist(data);
}

function durationFormat (duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = Math.floor(duration%60);
    if (seconds < 10){
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

async function getSetlist (identifier) {
    setlist = [];
    sideBarSetlist.textContent = '';
    let songString = ``;
    const response = await fetch(`${audioEmbed}${identifier}&output=json`, {mode: 'cors'});
    const data = await response.json();
    data.forEach ((song => {
        let songTime = durationFormat(song.duration);
        songString = `${song.title} - ${songTime}`;
        setlist.push(songString); 
    }))
    setlist.forEach((song, i)=> {
        let div = document.createElement('div');
        div.classList.add('sideBarItemSetlist');
        div.textContent = song;
        sideBarSetlist.appendChild(div);
        })
    sideBarSetlist.classList.replace('sideBar-hidden', 'sideBar-Setlist');
}

function getSources () {
    let identifier = shows[event.target.id][0].identifier;
    getSetlist(identifier);
    sideBarShow.textContent = '';
    let div = document.createElement('div')
    div.classList.add('sideBarItemShowTitle');
    div.textContent = shows[event.target.id][0].title;
    sideBarShow.appendChild(div);
    shows[event.target.id].forEach ((source, i) => {
         let div = document.createElement('div')
         div.classList.add('sideBarItemShow');
         div.id = source.identifier;
         div.setAttribute('title', source.title);
         div.textContent = source.source;
         sideBarShow.appendChild(div);
        // Dynamically Add Event Listeners
        document.getElementById(source.identifier).addEventListener('click', loadShow, event);
     })
     toggleMenu('Show');

}

function populateDates(){
    sideBarDate.textContent = '';
    shows.forEach ((date, i) => {
        let sliceDate = date[0].date.slice(0,10);
        let div = document.createElement('div')
        div.classList.add('sideBarItemDate');
        div.id = i;
        div.textContent = sliceDate;
        sideBarDate.appendChild(div);
        toggleMenu('Date');
        // Dynamically Add Event Listeners
        document.getElementById(i).addEventListener('click', getSources, event);

    })
}

// Sort into arrays by date to simplify display
function parseData(data) {   
    shows.length = 0;
    data.response.docs.forEach((show, i) => {  
        date = show.date;
        // Check if first run - initializes 'last' variables
        if(first) {
            last_date = date; 
            source_counter = 0;
            date_counter = 0; 
            shows[date_counter] = [];
            first = false;
        }
        // Is this a new date?
        /// If Yes: 1. Increment Counter 2. New Array 3. Set 'last_date'
        // If No: Move on
        if(date != last_date){
            date_counter++;
            last_date = date;
            shows[date_counter] = [];
            source_counter = 0;
        } 
        // Save Show
        shows[date_counter][source_counter] = show;
        //Increment source counter
        source_counter++;
    })
    populateDates();
}

async function getShowsByYear (event) {   
    let showURL = showsURL1+event.target.id+showsURL2;
    const response = await fetch(showURL, {mode:'cors'});
    //const data = await response.json();
    const data = await response.json();
    first = true;
    parseData(data);
    toggleMenu('Date');
}

function generateYearButtons () {
    toggleLoadingSpinner();
    for (i=1965; i<1996; i++){
        let div = document.createElement('div')
        div.classList.add('sideBarItem');
        div.id = i;
        div.textContent = i;
        sideBarYear.appendChild(div);
        // Dynamically Add Event Listeners
        document.getElementById(i).addEventListener('click', getShowsByYear, event);
    }
    toggleLoadingSpinner();
}

function generateDateButtons (event) {
    for (i=1965; i<1996; i++){
        let div = document.createElement('div')
        div.classList.add('sideBarItem');
        div.id = i;
        div.textContent = i;
        sideBarYear.appendChild(div);
        // Dynamically Add Event Listeners
        document.getElementById(i).addEventListener('click', getShowsByYear, event);
    }

}

async function getShows() {
    const response = await fetch(testURL, {mode:'cors'});
    data = await response.json();
    parseData(data);
}

// Keeps track of song within show
// If song ends, move to next
// If end of show, start over
function songEnded () {
    if (songIndex < songArray.length-1)
    {
        songIndex++;}
    else{
        songIndex=0;
    }
    playSong(songArray[songIndex]);
}

function audioFW () {
    //Check if show loaded
    if(songArray.length > 0){
        // Check if last song
        if (songIndex < songArray.length-1)
    {
        songIndex++;}
    else{
        songIndex=0;
    }
    audioToggleButton.innerHTML = 'Pause';
    playSong(songArray[songIndex]);
    } 
    else{
        alert('Load A Show First!');
    }
}

function audioBW () {
    //Check if show loaded
    if(songArray.length > 0){
        // Check if first song
        if (songIndex == 0)
    {
        // Roll Backwards
        songIndex = (songArray.length)-1;
    }
    else{
        songIndex--;
    }
    audioToggleButton.innerHTML = 'Pause';
    playSong(songArray[songIndex]);
    } 
    else{
        alert('Load A Show First!');
    }
}

function toggleAudio () {
    if(audioPlayer.paused && songArray.length > 0){
        audioToggleButton.innerHTML = 'Pause';
        audioPlayer.play();
    }
    else{
        audioToggleButton.innerHTML = 'Play';
        audioPlayer.pause();
    }
}

function toggleSongDisplay () {
    console.log('Toggling Song Display!');
    if(sideBarLoadedSongs.classList.contains('sideBar-hidden')){
        sideBarLoadedSongs.classList.replace('sideBar-hidden', 'sideBar-LoadedSongs');
    }
    
    else {
        sideBarLoadedSongs.classList.replace('sideBar-LoadedSongs', 'sideBar-hidden');
    }
    
}

audioPlayer.addEventListener('ended', songEnded);
displayTitle.addEventListener('click', showMenu);
document.addEventListener('keyup', event => {
    if(event.code === 'Space'){
        if(audioPlayer.paused && songArray.length > 0){
            audioToggleButton.innerHTML = 'Pause';
            audioPlayer.play();
        }
        else{
            audioToggleButton.innerHTML = 'Play';
            audioPlayer.pause();
        }
    }
})
audioForward.addEventListener('click', audioFW);
audioBackward.addEventListener('click', audioBW);
audioToggleButton.addEventListener('click', toggleAudio);
songToggleButton.addEventListener('click', toggleSongDisplay);

// Best progress using scrape search
// https://archive.org/services/search/v1/scrape?fields=title,year,date&q=collection%3Agratefuldead&and[]=mediatype%3A%22etree%22&and[]=year%3A%221977%22

// Things to sort by:
// Level 1: Year
// Level 2: Date
// Level 3: Source
// What we want is shows[][][]

generateYearButtons();