export default function useFeedback() {
  const vibrate = (pattern: number | number[] = [50, 100, 50]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const playArrivalSound = () => {
    try {
      const audio = new Audio("/sounds/arrival.mp3"); // add to /public/sounds
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  };

  return { vibrate, playArrivalSound };
}
