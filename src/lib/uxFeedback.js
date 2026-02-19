let soundsInitialized = false;
let soundEnabled = true;
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

const createTone = (frequency, duration, type = 'sine', volume = 0.1) => {
  const ctx = getAudioContext();
  if (!ctx) return false;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
    
    return true;
  } catch (e) {
    return false;
  }
};

export const initSounds = () => {
  if (soundsInitialized) return;
  soundsInitialized = true;
};

export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled;
  localStorage.setItem('earnedIt_soundEnabled', enabled ? 'true' : 'false');
};

export const getSoundEnabled = () => {
  const stored = localStorage.getItem('earnedIt_soundEnabled');
  if (stored !== null) {
    soundEnabled = stored === 'true';
  }
  return soundEnabled;
};

export const playSound = (type) => {
  if (!soundEnabled) return;
  
  switch (type) {
    case 'click':
      createTone(800, 0.05, 'sine', 0.03);
      break;
    case 'success':
      createTone(523, 0.1, 'sine', 0.05);
      setTimeout(() => createTone(659, 0.1, 'sine', 0.05), 100);
      setTimeout(() => createTone(784, 0.15, 'sine', 0.05), 200);
      break;
    case 'error':
      createTone(200, 0.15, 'square', 0.04);
      setTimeout(() => createTone(150, 0.2, 'square', 0.04), 150);
      break;
    case 'notification':
      createTone(880, 0.08, 'sine', 0.04);
      setTimeout(() => createTone(1100, 0.12, 'sine', 0.04), 100);
      break;
    case 'toggle':
      createTone(600, 0.03, 'sine', 0.02);
      break;
    case 'send':
      createTone(440, 0.05, 'triangle', 0.03);
      setTimeout(() => createTone(550, 0.08, 'triangle', 0.03), 50);
      break;
    case 'open':
      createTone(300, 0.06, 'sine', 0.03);
      setTimeout(() => createTone(400, 0.06, 'sine', 0.03), 60);
      setTimeout(() => createTone(500, 0.08, 'sine', 0.03), 120);
      break;
    case 'close':
      createTone(500, 0.06, 'sine', 0.03);
      setTimeout(() => createTone(400, 0.06, 'sine', 0.03), 60);
      setTimeout(() => createTone(300, 0.08, 'sine', 0.03), 120);
      break;
    default:
      break;
  }
};

const supportsVibration = () => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

export const haptic = (type = 'light') => {
  if (!supportsVibration()) return;
  
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10, 50, 30]);
        break;
      case 'error':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'selection':
        navigator.vibrate(5);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch (e) {
  }
};

export const feedback = (type) => {
  switch (type) {
    case 'buttonPress':
      haptic('light');
      playSound('click');
      break;
    case 'submit':
      haptic('medium');
      playSound('send');
      break;
    case 'success':
      haptic('success');
      playSound('success');
      break;
    case 'error':
      haptic('error');
      playSound('error');
      break;
    case 'toggle':
      haptic('selection');
      playSound('toggle');
      break;
    case 'open':
      haptic('light');
      playSound('open');
      break;
    case 'close':
      haptic('light');
      playSound('close');
      break;
    case 'notification':
      haptic('medium');
      playSound('notification');
      break;
    default:
      break;
  }
};

export const animateElement = (element, animationClass, duration = 600) => {
  if (!element) return;
  element.classList.add(animationClass);
  setTimeout(() => {
    element.classList.remove(animationClass);
  }, duration);
};

export const animateSuccess = (element) => animateElement(element, 'success-pulse', 600);
export const animateError = (element) => animateElement(element, 'shake', 400);
export const animateSlideIn = (element) => animateElement(element, 'slide-in', 300);
export const animateCheckAppear = (element) => animateElement(element, 'check-appear', 300);

export const useAnimatedRef = () => {
  const ref = { current: null };
  return {
    ref,
    triggerSuccess: () => animateSuccess(ref.current),
    triggerError: () => animateError(ref.current),
    triggerSlideIn: () => animateSlideIn(ref.current)
  };
};

export default {
  playSound,
  haptic,
  feedback,
  setSoundEnabled,
  getSoundEnabled,
  initSounds,
  animateElement,
  animateSuccess,
  animateError,
  animateSlideIn,
  animateCheckAppear
};
