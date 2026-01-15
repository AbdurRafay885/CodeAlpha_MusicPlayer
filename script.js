// MUSIC PLAYER DATA
const songs = [
  {
    title: "Neon Dreams",
    artist: "Cyber Pulse",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=500"
  },
  
  {
    title: "Midnight Drive",
    artist: "Lunar Waves",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1500468756762-a401b6f17b46?w=500"
  },

  {
    title: "Echoes of You",
    artist: "Stellar Dust",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500"
  },

  {
    title: "Floating City",
    artist: "Nova Sky",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    cover: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=500"
  },

  { title: "Starlight Code",  
    artist: "Digital Drift", 
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",  
    cover: "https://i.scdn.co/image/ab67616d00001e029a334672f136c625433edc57" 
  },

  {
  title: "Pulse Horizon",
  artist: "Neon Collective",
  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  cover: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=300"
  },
];

let currentSongIndex = 0;
let isPlaying = false;
let isMuted = false;

const audio = new Audio();
const cover = document.getElementById('cover');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeIcon = document.getElementById('volumeIcon');
const volumeBar = document.getElementById('volumeBar');
const volumeProgress = document.getElementById('volumeProgress');

const playlistContainer = document.querySelector('.playlist');

// Load & render playlist
function loadPlaylist() {
  playlistContainer.innerHTML = '';
  songs.forEach((song, index) => {
    const item = document.createElement('div');
    item.classList.add('playlist-item');
    if (index === currentSongIndex) item.classList.add('active');

    item.innerHTML = `
      <img src="${song.cover}" alt="cover">
      <div class="playlist-info">
        <div class="playlist-title">${song.title}</div>
        <div class="playlist-artist">${song.artist}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      currentSongIndex = index;
      loadSong();
      playSong();
    });

    playlistContainer.appendChild(item);
  });
}

function loadSong() {
  const song = songs[currentSongIndex];
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  cover.src = song.cover;
  audio.src = song.src;

  // Update active playlist item
  document.querySelectorAll('.playlist-item').forEach((item, i) => {
    item.classList.toggle('active', i === currentSongIndex);
  });

  audio.load();
}

function playSong() {
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  playBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e53)';
  isPlaying = true;
  audio.play().catch(e => console.log("Playback prevented:", e));
}

function pauseSong() {
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  playBtn.style.background = 'linear-gradient(45deg, #00d4ff, #0077ff)';
  isPlaying = false;
  audio.pause();
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong();
  playSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong();
  playSong();
}

// Time & Progress
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;

    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  }
});

audio.addEventListener('ended', nextSong);

// Progress bar seek
progressBar.addEventListener('click', (e) => {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
});

// Volume control
volumeBar.addEventListener('click', (e) => {
  const width = volumeBar.clientWidth;
  const clickX = e.offsetX;
  const vol = clickX / width;
  audio.volume = vol;
  volumeProgress.style.width = `${vol * 100}%`;
});

// Mute/Unmute Toggle
volumeIcon.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;

  if (isMuted) {
    // Change to Mute icon
    volumeIcon.classList.remove('fa-volume-up');
    volumeIcon.classList.add('fa-volume-mute');
    volumeIcon.style.opacity = '0.5';
    volumeProgress.style.width = '0%'; 
  } 
  
  else {
    // Change back to Volume icon
    volumeIcon.classList.remove('fa-volume-mute');
    volumeIcon.classList.add('fa-volume-up');
    volumeIcon.style.opacity = '1';
    volumeProgress.style.width = `${audio.volume * 100}%`; 
  }
});

// Controls
playBtn.addEventListener('click', () => {
  if (isPlaying) pauseSong();
  else playSong();
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Autoplay next + initial load
audio.addEventListener('canplaythrough', () => {
  durationEl.textContent = formatTime(audio.duration);
});

loadPlaylist();
loadSong();

// Optional: Uncomment to auto-start first song
// playSong();