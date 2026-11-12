import { useEffect, useRef, useState } from 'react';
import './HouseAnimationPlayer.css';

const film = '/assets/animated/house-motion-loop.mp4';

export default function HouseAnimationPlayer() {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const previousFocus = document.activeElement;
    let alive = true;
    try { dialog.showModal(); }
    catch { window.location.assign(film); return undefined; }
    const playback = video.play();
    playback?.catch(() => { if (alive) setNeedsPlay(true); });
    return () => {
      alive = false;
      video.pause();
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [open]);

  function watch(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof window.HTMLDialogElement?.prototype?.showModal !== 'function') return;
    event.preventDefault();
    setFailed(false);
    setNeedsPlay(false);
    setOpen(true);
  }

  return <>
    <a className="ae-film-link" href={film} onClick={watch} aria-label="Play animation of the house">
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6V4Z" fill="currentColor" /></svg>
      Play animation
    </a>
    {open && <dialog ref={dialogRef} className="ae-film-dialog" aria-labelledby="ae-film-title"
      onCancel={() => setOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="ae-film-toolbar"><h2 id="ae-film-title">House animation</h2><button type="button" autoFocus aria-label="Close animation video" onClick={() => setOpen(false)}>×</button></div>
      <video ref={videoRef} src={film} poster="/assets/animated/house-complete.webp"
        controls autoPlay muted playsInline loop preload="metadata"
        aria-label="House opening and reassembly, architectural concept"
        onPlaying={() => setNeedsPlay(false)} onError={() => setFailed(true)} />
      <div className="ae-film-caption"><p>Architectural concept.</p><a href={film}>Open video directly <span aria-hidden="true">↗</span></a></div>
      {failed && <p className="ae-film-message" role="status">The video could not load. Try opening it directly.</p>}
      {!failed && needsPlay && <p className="ae-film-message" role="status">Press Play in the video to start.</p>}
    </dialog>}
  </>;
}
