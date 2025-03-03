import { decorateIcons } from '../../scripts/aem.js';

function decorateTeaserPicture(teaserPicture, target) {
  teaserPicture.parentElement.classList.add('video-cover');
  target.appendChild(teaserPicture.parentElement);
}

function playVideoAnimation(e) {
  const playIcon = e.target.closest('.hero-video')
    .querySelector('.play-pause-fullscreen-button .icon-full-screen-play');
  if (playIcon) {
    playIcon.style.opacity = 1;
    setTimeout(() => { playIcon.style.opacity = 0; }, 400);
  }
}

function pauseVideoAnimation(e) {
  const pauseIcon = e.target.closest('.hero-video')
    .querySelector('.play-pause-fullscreen-button .icon-full-screen-pause');
  if (pauseIcon) {
    pauseIcon.style.opacity = 1;
    setTimeout(() => { pauseIcon.style.opacity = 0; }, 400);
  }
}

function decorateTeaser(video, teaserPicture, target) {
  if (!video && !teaserPicture) return;

  if (!video) {
    teaserPicture.style.setProperty('display', 'block', 'important');
    decorateTeaserPicture(teaserPicture, target);
    return;
  }

  const videoTag = document.createElement('video');
  if (!teaserPicture) {
    videoTag.style.setProperty('display', 'block', 'important');
  } else {
    videoTag.setAttribute('poster', teaserPicture.currentSrc);
    decorateTeaserPicture(teaserPicture, target);
  }

  videoTag.classList.add('video-cover');
  videoTag.setAttribute('muted', '');
  videoTag.setAttribute('loop', '');
  videoTag.setAttribute('title', video.title);

  const mql = window.matchMedia('only screen and (max-width: 768px)');
  if (mql.matches && teaserPicture) {
    videoTag.setAttribute('preload', 'metadata');
  } else {
    videoTag.setAttribute('autoplay', '');
  }

  mql.onchange = (e) => {
    if (!e.matches && !videoTag.hasAttribute('autoplay')) {
      videoTag.setAttribute('autoplay', '');
      videoTag.play();
    }
  };

  const source = document.createElement('source');
  source.src = video.href;
  source.type = 'video/mp4';
  videoTag.appendChild(source);

  target.prepend(videoTag);
  videoTag.muted = true;
  video.remove();
}

function decorateOverlayButton(fullScreenVideoLink, block, overlay) {
  const button = document.createElement('button');
  button.classList.add('video-banner-btn');
  button.innerHTML = fullScreenVideoLink.innerHTML;

  button.addEventListener('click', () => {
    const fullVideoContainer = block.querySelector('.full-video-container');
    fullVideoContainer.style.display = 'block';
    const video = fullVideoContainer.querySelector('video');
    video.play();

    const playHandler = () => playVideoAnimation(video);
    const pauseHandler = () => pauseVideoAnimation(video);

    video.addEventListener('play', playHandler);
    video.addEventListener('pause', pauseHandler);

    const closeButton = fullVideoContainer.querySelector('.close-video');
    closeButton.addEventListener('click', () => {
      video.removeEventListener('play', playHandler);
      video.removeEventListener('pause', pauseHandler);
      video.pause();
      video.currentTime = 0;
      video.load();
      fullVideoContainer.style.display = 'none';
    });
  });

  overlay.appendChild(button);
  fullScreenVideoLink.remove();
}

function createIcons(target, iconNames) {
  iconNames.forEach((iconName) => {
    const icon = document.createElement('span');
    icon.classList.add('icon', `icon-${iconName}`);
    target.appendChild(icon);
  });
  decorateIcons(target);
}

function toggleVideoPlay(video) {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

async function decorateFullScreenVideo(fullScreenVideoLinkHref, teaserPicture, target) {
  const fullVideoContainer = document.createElement('div');
  fullVideoContainer.classList.add('full-video-container');

  const video = document.createElement('video');
  video.classList.add('video-cover');
  video.setAttribute('preload', 'metadata');
  video.setAttribute('poster', teaserPicture.currentSrc);

  const source = document.createElement('source');
  source.src = fullScreenVideoLinkHref;
  source.type = 'video/mp4';
  video.appendChild(source);

  video.addEventListener('click', () => toggleVideoPlay(video));

  const closeVideoButton = document.createElement('div');
  closeVideoButton.classList.add('close-video');
  createIcons(closeVideoButton, ['close-video']);
  closeVideoButton.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    video.load();
    fullVideoContainer.style.display = 'none';
  });

  const playPauseVideoButton = document.createElement('div');
  playPauseVideoButton.classList.add('play-pause-fullscreen-button');
  createIcons(playPauseVideoButton, ['full-screen-play', 'full-screen-pause']);
  playPauseVideoButton.addEventListener('click', () => toggleVideoPlay(video));

  fullVideoContainer.appendChild(closeVideoButton);
  fullVideoContainer.appendChild(playPauseVideoButton);
  fullVideoContainer.appendChild(video);
  target.appendChild(fullVideoContainer);
}

export default function decorate(block) {
  const videoBanner = block.children[0];
  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  heroContent.classList.add('teaser-video-container');

  const teaserVideoLink = heroContent.querySelector('a');
  const teaserPicture = heroContent.querySelector('img');

  decorateTeaser(teaserVideoLink, teaserPicture, heroContent);

  const overlay = videoBanner.children[1];
  overlay.classList.add('overlay');

  const fullScreenVideoLink = overlay.querySelector('a:last-of-type');
  if (!fullScreenVideoLink) return;

  const fullScreenVideoLinkHref = fullScreenVideoLink.href;
  decorateOverlayButton(fullScreenVideoLink, block, overlay);
  decorateFullScreenVideo(fullScreenVideoLinkHref, teaserPicture, videoBanner);
}
