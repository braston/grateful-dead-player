const showsURL1 = 'https://archive.org/advancedsearch.php?q=grateful%20dead%20AND%20creator:grateful%20dead%20AND%20year:';
const showsURL2 = '%20AND%20creator:grateful%20dead&fl%5B%5D=identifier,title,year,date,creator,source&and%5B%5D=mediatype%3A%22etree%22&rows=1000&output=json&sort%5B%5D=date+asc';
let audioEmbed = 'https://archive.org/embed/';

// TO DO:
// 1- Add setlist when show pulls up in browser- get setlist for all sources, display when hover
// 2- Click on show title to bring browser back, in same state (is this possible) 

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
let sideBarYear = document.getElementById('sideBarYear');
let sideBarDate = document.getElementById('sideBarDate');
let sideBarShow = document.getElementById('sideBarShow');
let sideBarSetlist = document.getElementById('sideBarSetlist');
let toggleIcon = document.getElementById('menuToggle');
let navListeners = [];
let showTitle = '';
let setlist = [];
hidden = false;

function menuIcon(x) {
    x.classList.toggle("change");
    hidden ? sideBarYear.classList.replace('sideBar-hidden','sideBar-Year') : sideBarYear.classList.replace('sideBar-Year', 'sideBar-hidden');
    hidden ? null:sideBarDate.classList.replace('sideBar-Date', 'sideBar-hidden');
    hidden ? null:sideBarShow.classList.replace('sideBar-Show', 'sideBar-hidden');
    hidden ? null:sideBarSetlist.classList.replace('sideBar-Setlist', 'sideBar-hidden');
    hidden = !hidden;
  }

function hideMenu() {
    toggleIcon.classList.toggle("change");
    hidden = !hidden;
    sideBarYear.classList.replace('sideBar-Year', 'sideBar-hidden');
    sideBarDate.classList.replace('sideBar-Date', 'sideBar-hidden');
    sideBarShow.classList.replace('sideBar-Show', 'sideBar-hidden');
    sideBarSetlist.classList.replace('sideBar-Setlist', 'sideBar-hidden');
}

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
    displayTitle.innerHTML = `Now Playing: ${song.textContent} 
    from ${showTitle}`;
    displayTitle.removeAttribute('hidden');
    audioPlayer.play();
}

function createPlaylist (data){ 
    audioContent.textContent = '';  
    data.forEach((item, i) => {
        let song = `${item.title}`;
     //    Create new HTML element for every song
        const newElement = document.createElement('div');
        newElement.textContent = song;
        newElement.classList.add('song');
        newElement.id = `song${i}`
        let songURL = `https://archive.org${item.sources[0].file}`;
        newElement.setAttribute('src', songURL);
        audioContent.appendChild(newElement);
        songArray[i] = document.getElementById(`song${i}`);
        audioPlayer.removeAttribute('hidden');
        audioButton.setAttribute("hidden", "");
    })
 
 //    Add event listener for each loaded song
    songArray.forEach(song => {
        song.addEventListener('click', function(){
            playSong(song);
        });
    })
    hideMenu();
    // Auto Start Show
    playSong(songArray[0]);
 };

async function loadShow (event) {
    showTitle = '';
    showURL = `${audioEmbed}${event.toElement.id}&output=json`;
    const response = await fetch(showURL);
    data = await response.json();  
    showTitle = event.toElement.title;
    createPlaylist(data);
}

function showSetlist(){
    console.log('Showing Setlist');
    console.log(setlist);
    setlist.forEach((song, i)=> {
    SideBarSetlist.textContent = '';
    let div = document.createElement('div')
    div.classList.add('sideBarItemSetlist');
    div.textContent = song[i];
    sideBarSetlist.appendChild(div);
    })
}

async function getSetlist (identifier) {
    setlist = [];
    console.log('Getting Setlist...');
    const response = await fetch(`${audioEmbed}${identifier}&output=json`);
    const data = await response.json();
    console.log(data);
    data.forEach ((song => {
        console.log(song);
        setlist.push(song.title); 
    }))
    console.log(setlist);
    sideBarSetlist.classList.replace('sideBar-hidden', 'sideBar-Setlist');
}

function getSources () {
    let identifier = shows[event.toElement.id][0].identifier;
    getSetlist(identifier);
    sideBarShow.textContent = '';
    let div = document.createElement('div')
    div.classList.add('sideBarItemShowTitle');
    div.textContent = shows[event.toElement.id][0].title;
    sideBarShow.appendChild(div);
    shows[event.toElement.id].forEach ((source, i) => {
         let div = document.createElement('div')
         div.classList.add('sideBarItemShow');
         div.id = source.identifier;
         div.setAttribute('title', source.title);
         div.textContent = source.source;
         sideBarShow.appendChild(div);
        // Dynamically Add Event Listeners
        document.getElementById(source.identifier).addEventListener('click', loadShow, event);
     })
     showSetlist();
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
    let showURL = showsURL1+event.toElement.id+showsURL2;
    const response = await fetch(showURL);
    const data = await response.json();
    first = true;
    parseData(data);
    toggleMenu('Date');
}

function generateYearButtons () {
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
    const response = await fetch(testURL);
    data = await response.json();
    parseData(data);
}

// Best progress using scrape search
// https://archive.org/services/search/v1/scrape?fields=title,year,date&q=collection%3Agratefuldead&and[]=mediatype%3A%22etree%22&and[]=year%3A%221977%22

// Things to sort by:
// Level 1: Year
// Level 2: Date
// Level 3: Source
// What we want is shows[][][]

generateYearButtons();