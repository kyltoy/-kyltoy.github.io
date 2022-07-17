document.addEventListener('wheel', async function(e){
  e.preventDefault();
  // mutex lock for sleep when wheel
  if (!window.wheelMutex){
    window.wheelMutex = true;
    let y = window.scrollY;
    let h = window.innerHeight;
    window.scrollTo(0, Math.ceil((y + h * Math.sign(e.deltaY)) / h) * h);
    await sleep(800);
    window.wheelMutex = false;
  }
}, { passive: false });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}