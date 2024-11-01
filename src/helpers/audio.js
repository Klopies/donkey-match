const BASE_AUDIO_URL = "/public/sounds/";

/**
 * @param {String | Array<String>} sounds
 */
export const playSound = (sounds) => {
  let sound = sounds;
  if (sounds instanceof Array) {
    sound = sounds[Math.floor(Math.random() * sounds.length)];
  }
  const audio = new Audio(BASE_AUDIO_URL + sound);
  audio.play();
};

export const preloadSounds = (sounds) => {
  const promises = sounds.map((sound) => new Promise((resolve) => {
    const audio = new Audio(BASE_AUDIO_URL + sound);
    audio.addEventListener("canplaythrough", () => {
      resolve();
    });
  }));
  return Promise.all(promises);
};