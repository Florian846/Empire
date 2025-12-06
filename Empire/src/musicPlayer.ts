const MUSIC_FILES = [
  "src/musik/Battlefield Echoes.mp3",
  "src/musik/Battlefront March.mp3",
  "src/musik/Echoes of the Iron Vanguard.mp3",
  "src/musik/Frontline of the Fallen Empire.mp3",
  "src/musik/Legion of the Silent Dawn.mp3",
  "src/musik/March of Shadows.mp3",
  "src/musik/March to the forgotten Horizon.mp3",
  "src/musik/Shadows of the Crimson Barrage.mp3",
];

export class MusicPlayer {
  private lastTwoSongs: string[] = [];
  private currentSong: HTMLAudioElement | null = null;
  private volume: number = 1;

  public setVolume(volume: number) {
    this.volume = volume;
    if (this.currentSong) {
      this.currentSong.volume = this.volume;
    }
  }

  private onSongEnd: () => void;
  private onSongError: () => void;

  constructor() {
    console.log("MusicPlayer initialized");
    this.onSongEnd = this.scheduleNextSong.bind(this);
    this.onSongError = () => {
      // This is bound to the instance via the arrow function
      console.error(`Failed to load song: ${this.currentSong?.src}`);
      this.scheduleNextSong();
    };
  }

  public start() {
    console.log("Starting music player...");
    this.playNextSong();
  }

  private playNextSong() {
    const nextSongPath = this.selectNextSong();
    if (!nextSongPath) {
      console.warn("No songs available to play.");
      return;
    }

    this.currentSong = new Audio(nextSongPath);
    this.currentSong.volume = this.volume;

    this.currentSong.addEventListener("ended", this.onSongEnd);
    this.currentSong.addEventListener("error", this.onSongError);

    this.currentSong
      .play()
      .then(() => {
        console.log(`Now playing: ${nextSongPath}`);
      })
      .catch((error) => {
        // This catch is for when play() is interrupted or fails.
        // The 'error' event on the element handles loading failures.
        console.error(
          `Error initiating playback for song: ${nextSongPath}`,
          error,
        );
        this.scheduleNextSong();
      });
  }

  private scheduleNextSong() {
    if (this.currentSong) {
      // Clean up old event listeners to prevent memory leaks
      this.currentSong.removeEventListener("ended", this.onSongEnd);
      this.currentSong.removeEventListener("error", this.onSongError);
      this.currentSong = null;
    }

    const minDelay = 2 * 60 * 1000; // 2 minutes
    const maxDelay = 5 * 60 * 1000; // 5 minutes
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    console.log(`Next song in ${(delay / 1000 / 60).toFixed(2)} minutes.`);
    setTimeout(() => this.playNextSong(), delay);
  }

  private selectNextSong(): string | null {
    const availableSongs = MUSIC_FILES.filter(
      (song) => !this.lastTwoSongs.includes(song),
    );

    if (availableSongs.length === 0) {
      // This happens if there are 2 or fewer songs.
      // Or if all songs have been played recently.
      // In this case, we can just pick from all songs, excluding the last one.
      const allButLast = MUSIC_FILES.filter(
        (song) => song !== this.lastTwoSongs[1],
      );
      if (allButLast.length === 0) return MUSIC_FILES[0] || null;
      const randomIndex = Math.floor(Math.random() * allButLast.length);
      return allButLast[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    const selectedSong = availableSongs[randomIndex];

    this.lastTwoSongs.push(selectedSong);
    if (this.lastTwoSongs.length > 2) {
      this.lastTwoSongs.shift();
    }

    return selectedSong;
  }
}
