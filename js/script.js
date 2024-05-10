let songsList = [];
var currentSong = new Audio();
let currentSongList=[];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


async function getSongs(url) {
    let a = await fetch(url)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songsList=[];
    for (let index = 0; index < as.length; index++) {
        const ele = as[index];
        if (ele.href.endsWith(".m4a")) {
            songsList.push([ele.href, ele.title]);
        }
    }
    return songsList;
}

let titleurl = null;
function getSongName(fileName) {
    const parts = fileName.split('.');
    const namePart = parts[0];
    const nameParts = namePart.split(' - ');
    const songName = nameParts[0];
    return songName;
}

async function displalib(name) {
    let songs = await getSongs(`http://127.0.0.1:5500/songs/${name}`);
    songsList = songs;
    fetch('./songs/info.json')
        .then((response) => response.json())
        .then((json) => {
            titleurl = json[name].img;
            let midDiv = document.querySelector('.mid');
            midDiv.innerHTML = '';
            for (let i = 0; i < songs.length; i++) {
                let div = document.createElement("div");
                div.className = "song";
                div.onclick = function () { playSong(songs[i][0], songs[i][1]); };
                div.innerHTML = `<img src="${titleurl}" alt="" class="img"><span>${getSongName(songs[i][1])}</span>`;
                midDiv.appendChild(div);
            }
            playSong(songs[0][0], songs[0][1]);
        });
}
function formatDuration(durationInSeconds) {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    const formattedMinutes = String(minutes).padStart(1, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function playSong(url, name) {
    currentSongList=[url,name]
    currentSong.src = url;
    currentSong.addEventListener('loadedmetadata', function () {
        let duration = currentSong.duration;
        document.querySelector(".max-time").innerHTML = formatDuration(duration);
    });
    currentSong.play();
    displayPlayingSong();
    document.querySelector(".white-p").src = "./Images/pause.svg";
    document.querySelector(".albem").innerHTML = `<img src="${titleurl}" alt="">
    <span>${getSongName(name)}</span>`;
}



async function getLists(url) {
    try {
        let response = await fetch(url);
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let spans = div.getElementsByClassName("name");
        let list = [];
        for (let index = 0; index < spans.length; index++) {
            const ele = spans[index];
            if (!ele.innerHTML.endsWith(".")) {
                let infoResponse = await fetch('./songs/info.json');
                let infoJson = await infoResponse.json();
                list.push([ele.innerHTML,infoJson[ele.innerHTML].singers, infoJson[ele.innerHTML].img,infoJson[ele.innerHTML].name]);
            }
        }
        return list;
    } catch (error) {
        console.error("Error fetching playlist:", error);
        return [];
    }
}

async function displaplaylist() {
    try {
        let list = await getLists(`https://github.com/myselfvivek17/spotify-clone/tree/main/songs`);
        console.log(list);
        let plc = document.querySelector(".playlistcontainer");
        for (let i = 0; i < list.length; i++) {
            let div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <img src="${list[i][2]}" alt="" class="img">
                <div class="playbutton" onclick="displalib('${list[i][0]}')">
                    <img src="./Images/play.svg" alt="" class="svg-play">
                </div>
                <span>${list[i][3]}</span>
                <p>${list[i][1]}</p>`;
            plc.appendChild(div);
        }
    } catch (error) {
        console.error("Error displaying playlist:", error);
    }
}


displaplaylist()


function playpauseSong() {
    if (currentSong.src) {
        if (!currentSong.paused) {
            currentSong.pause();
            document.querySelector(".white-p").src = "./Images/play.svg";
        } else {
            currentSong.play();
            document.querySelector(".white-p").src = "./Images/pause.svg";
        }
    }
}


currentSong.addEventListener("timeupdate", () => {
    let duer = currentSong.duration;
    let current = currentSong.currentTime;
    let percentage = (current / duer) * 100;
    document.querySelector(".circle").style.left = percentage + "%";
    var gradient = "linear-gradient(to right, white " + percentage + "%, gray " + percentage + "%)";
    document.querySelector(".bar").style.background = gradient;
    document.querySelector(".current-time").innerHTML = `${formatDuration(currentSong.currentTime)}`;
    if(duer==current){
        nextSong();
    }
})

document.querySelector(".bar").addEventListener("click", e => {
    let percentage = e.offsetX / e.target.getBoundingClientRect().width * 100;
    document.querySelector(".circle").style.left = percentage + "%";
    var gradient = "linear-gradient(to right, white " + percentage + "%, gray " + percentage + "%)";
    document.querySelector(".bar").style.background = gradient;
    currentSong.currentTime = currentSong.duration * percentage / 100;
})


const volumeControl = document.getElementById('volumeControl');

volumeControl.addEventListener('input', function () {
    currentSong.volume = volumeControl.value;
});

function nextSong(){
    let index=songsList.findIndex(arr => arr[0] === currentSongList[0] && arr[1] === currentSongList[1]);
    if(index<songsList.length){
        playSong(songsList[index+1][0],songsList[index+1][1]);
    }
}

function preSong(){
    let index=songsList.findIndex(arr => arr[0] === currentSongList[0] && arr[1] === currentSongList[1]);
    if(index>0){
        playSong(songsList[index-1][0],songsList[index-1][1]);
    }
}

function shuffle(){
    let temp=shuffleArray(songsList);
    playSong(temp[0][0],temp[0][1]);
}


let pren;
let n;
function displayPlayingSong(){
    pren=n;
    n=songsList.findIndex(arr => arr[0] === currentSongList[0] && arr[1] === currentSongList[1])+1;
    const songs = document.querySelectorAll('.song');
    if (n >= 1 && n <= songs.length) {
      songs[n - 1].style.backgroundColor = "red";
    }
    if (pren >= 1 && pren <= songs.length) {
        songs[pren - 1].style.backgroundColor = "transparent";
    }
    
}


function openmenu(){
    document.querySelector('.left').style.left="0";
    document.querySelector('.left').style.width="60dvw";
    document.querySelector('.left').style.height="100%";
    document.querySelector('.playlists h2').style.color="transparent";
}

function closeMenu(){
    document.querySelector('.left').style.width="23vw";
    document.querySelector('.left').style.left="-27vw";
    document.querySelector('.playlists h2').style.color="white";
}
