import { useEffect, useId, useRef, useState } from 'react';
import './HouseAnimationPlayer.css';

const film = '/assets/animated/house-motion-loop.mp4';

export default function HouseAnimationPlayer({
  source = film,
  poster = '/assets/animated/house-complete.webp',
  label = 'Play animation',
  ariaLabel = 'Play animation of the house',
  title = 'House animation',
  description = 'House opening and reassembly, architectural concept',
  loop = true,
}) {
  const titleId = useId();
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    // Safari may leave a mouse-activated link unfocused. Always return to
    // this player's trigger when its modal closes.
    const previousFocus = triggerRef.current || document.activeElement;
    let alive = true;
    try { dialog.showModal(); }
    catch { window.location.assign(source); return undefined; }
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
  }, [open, source]);

  function watch(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof window.HTMLDialogElement?.prototype?.showModal !== 'function') return;
    event.preventDefault();
    setFailed(false);
    setNeedsPlay(false);
    setOpen(true);
  }

  return <>
    <a ref={triggerRef} className="ae-film-link" href={source} onClick={watch} aria-label={ariaLabel}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6V4Z" fill="currentColor" /></svg>
      {label}
    </a>
    {open && <dialog ref={dialogRef} className="ae-film-dialog" aria-labelledby={titleId}
      onCancel={() => setOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="ae-film-toolbar"><h2 id={titleId}>{title}</h2><button type="button" autoFocus aria-label="Close animation video" onClick={() => setOpen(false)}>×</button></div>
      <video ref={videoRef} src={source} poster={poster}
        controls autoPlay muted playsInline loop={loop} preload="metadata"
        aria-label={description}
        onPlaying={() => setNeedsPlay(false)} onError={() => setFailed(true)} />
      <div className="ae-film-caption"><p>Architectural concept.</p><a href={source}>Open video directly <span aria-hidden="true">↗</span></a></div>
      {failed && <p className="ae-film-message" role="status">The video could not load. Try opening it directly.</p>}
      {!failed && needsPlay && <p className="ae-film-message" role="status">Press Play in the video to start.</p>}
    </dialog>}
  </>;
}
