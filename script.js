let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

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

async function fetchMusic() {
  try {
    const searchUrl = 
      'https://archive.org/advancedsearch.php?' +
      'q=collection:etree+AND+mediatype:audio+AND+format:MP3' + 
      '&fl[]=identifier,title,creator,date' +
      '&sort[]=-downloads' +   
      '&rows=15' +            
      '&page=1' +
      '&output=json';

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.response || !searchData.response.docs) {
      throw new Error("No results from archive search");
    }

    const items = searchData.response.docs;
    songs = [];

    // For each item, get metadata to find MP3 file URLs
    for (const item of items) {
      const identifier = item.identifier;
      try {
        const metaUrl = `https://archive.org/metadata/${identifier}`;
        const metaRes = await fetch(metaUrl);
        const meta = await metaRes.json();

        if (!meta.files) continue;

        // Find a playable MP3 file
        let mp3File = meta.files.find(f => 
          f.name.endsWith('.mp3') && 
          (f.format?.includes('VBR') || f.format?.includes('MP3') || f.source === 'derivative')
        ) || meta.files.find(f => f.name.endsWith('.mp3'));

        if (!mp3File) continue;

        const fileName = mp3File.name;
        const src = `https://archive.org/download/${identifier}/${encodeURIComponent(fileName)}`;

        // Cover
        const coverUrl = meta.misc?.image 
          ? `https://archive.org/download/${identifier}/${meta.misc.image}`
          : `https://archive.org/services/img/${identifier}`;

        songs.push({
          title: item.title || meta.metadata?.title?.[0] || "Live Concert",
          artist: item.creator || meta.metadata?.creator?.[0] || "Various Artists",
          src: src,
          cover: coverUrl,
          duration: parseInt(mp3File.length || 300)  // fallback ~5 min
        });

      } catch (e) {
        console.warn(`Failed to process item ${identifier}:`, e);
      }
    }

    if (songs.length === 0) {
      throw new Error("No playable MP3 tracks found");
    }

    loadPlaylist();
    loadSong();

  } catch (err) {
    console.error("Archive.org etree fetch error:", err);
    alert("Couldn't load live music from Internet Archive.\n\nPossible reasons:\n- Network issue\n- No MP3 derivatives available right now\n\nTry refreshing or check console for details.");
    
    // Optional fallback
    songs = [{
      title: "Fallback Track",
      artist: "SoundHelix",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      cover: "https://via.placeholder.com/300?text=♪"
    }];
    loadPlaylist();
    loadSong();
  }
}

// Load & render playlist
function loadPlaylist() {
  playlistContainer.innerHTML = '';
  songs.forEach((song, index) => {
    const item = document.createElement('div');
    item.classList.add('playlist-item');
    if (index === currentSongIndex) item.classList.add('active');

    item.innerHTML = `
      <img src="${song.cover}" alt="cover" onerror="this.src='https://via.placeholder.com/60?text=♪'">
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
  if (songs.length === 0) return;

  const song = songs[currentSongIndex];
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  cover.src = song.cover;
  audio.src = song.src;

  // Reset progress
  progress.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = song.duration ? formatTime(song.duration) : '0:00';

  document.querySelectorAll('.playlist-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentSongIndex);
  });

  audio.load();
}

function playSong() {
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  playBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e53)';
  isPlaying = true;
  audio.play().catch(e => console.log("Playback prevented (autoplay policy?):", e));
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

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', nextSong);

progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pos * audio.duration;
});

volumeBar.addEventListener('click', (e) => {
  const rect = volumeBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audio.volume = Math.max(0, Math.min(1, pos));
  volumeProgress.style.width = `${pos * 100}%`;
});

volumeIcon.addEventListener('click', () => {
  audio.muted = !audio.muted;

  volumeIcon.classList.toggle('fa-volume-mute', audio.muted);
  volumeIcon.classList.toggle('fa-volume-up', !audio.muted);
  volumeIcon.style.opacity = audio.muted ? '0.5' : '1';

  if (audio.muted) {
    volumeProgress.style.width = '0%';
  } else {
    volumeProgress.style.width = `${audio.volume * 100}%`;
  }
});

playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

fetchMusic();  
volumeProgress.style.width = `${audio.volume * 100}%`;
