// Load the external player only after the visitor chooses to watch.
document.querySelectorAll(".site-demo-player").forEach((player) => {
  const button = player.querySelector(".site-demo-play");
  button.addEventListener(
    "click",
    () => {
      const iframe = document.createElement("iframe");
      iframe.src = player.dataset.videoSrc;
      iframe.title = player.dataset.videoTitle;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      player.replaceChildren(iframe);
      iframe.focus();
    },
    { once: true },
  );
});
