function initializeParallax(clip, forceSticky) {
  var parallax = clip.querySelectorAll('*[parallax]');
  var parallaxDetails = [];
  var sticky = forceSticky;

  for (var i = 0; i < parallax.length; i++) {
    var elem = parallax[i];
    var container = elem.parentNode;
    if (getComputedStyle(container).overflow != 'visible') {
      console.error('Need non-scrollable container to apply perspective for ', elem);
      continue;
    }
    if (clip && container.parentNode != clip) {
      console.warn('Currently we only track a single overflow clip, but elements from multiple clips found.', elem);
    }
    var clip = container.parentNode;
    if (getComputedStyle(clip).overflow == 'visible') {
      console.error('Parent of sticky container should be scrollable element', elem);
    }
    // TODO(flackr): optimize to not redo this for the same clip/container.
    var perspectiveElement;
    if (sticky || getComputedStyle(clip).webkitOverflowScrolling) {
      sticky = true;
      perspectiveElement = container;
    } else {
      perspectiveElement = clip;
      container.style.transformStyle = 'preserve-3d';
    }
    perspectiveElement.style.perspectiveOrigin = 'bottom right';
    perspectiveElement.style.perspective = '1px';
    if (sticky)
      elem.style.position = '-webkit-sticky';
    if (sticky)
      elem.style.top = '0';
    elem.style.transformOrigin = 'bottom right';

    // Find the previous and next elements to parallax between.
    var previousCover = parallax[i].previousElementSibling;
    while (previousCover && !previousCover.hasAttribute('parallax-cover'))
      previousCover = previousCover.previousElementSibling;
    var nextCover = parallax[i].nextElementSibling;
    while (nextCover && !nextCover.hasAttribute('parallax-cover'))
      nextCover = nextCover.nextElementSibling;

    parallaxDetails.push({'node': parallax[i],
                          'top': parallax[i].offsetTop,
                          'height': parallax[i].offsetHeight,
                          'sticky': !!sticky,
                          'nextCover': nextCover,
                          'previousCover': previousCover});
  }

  // Add a scroll listener to hide perspective elements when they should no
  // longer be visible.
  clip.addEventListener('scroll', function() {
    for (var i = 0; i < parallaxDetails.length; i++) {
      var container = parallaxDetails[i].node.parentNode;
      var previousCover = parallaxDetails[i].previousCover;
      var nextCover = parallaxDetails[i].nextCover;
      var parallaxStart = previousCover ? (previousCover.offsetTop + previousCover.offsetHeight) : 0;
      var parallaxEnd = nextCover ? nextCover.offsetTop : container.offsetHeight;
      var threshold = 200;
      var visible = parallaxStart - threshold - clip.clientHeight < clip.scrollTop &&
                    parallaxEnd + threshold > clip.scrollTop;
      var display = visible ? 'block' : 'none'
      if (parallaxDetails[i].node.style.display != display)
        parallaxDetails[i].node.style.display = display;
    }
  });
  window.addEventListener('resize', onResize.bind(null, parallaxDetails));
  onResize(parallaxDetails);
  for (var i = 0; i < parallax.length; i++) {
    parallax[i].parentNode.insertBefore(parallax[i], parallax[i].parentNode.firstChild);
  }
}

function onResize(details) {
  for (var i = 0; i < details.length; i++) {
    var container = details[i].node.parentNode;

    var clip = container.parentNode;
    var previousCover = details[i].previousCover;
    var nextCover = details[i].nextCover;
    var parallaxStart = previousCover ? (previousCover.offsetTop + previousCover.offsetHeight) : 0;
    var parallaxEnd = nextCover ? nextCover.offsetTop : container.offsetHeight;
    console.log('Parallax from ' + parallaxStart + ' to ' + parallaxEnd);
    var scrollbarWidth = details[i].sticky ? 0 : clip.offsetWidth - clip.clientWidth;
    var parallaxElem = details[i].sticky ? container : clip;
    var d2 = details[i].height - clip.clientHeight;

    var depth = (details[i].height - parallaxEnd + parallaxStart) / d2;
    if (details[i].sticky)
      depth = 1.0 / depth;

    var scale = 1.0 / (1.0 - depth);

    // The scrollbar is included in the 'bottom right' perspective origin.
    var dx = scrollbarWidth * (scale - 1);
    // Offset for the position within the container.
    var dy = details[i].sticky ?
        -(clip.scrollHeight - parallaxStart - details[i].height) * (1 - scale) :
        (parallaxEnd - details[i].height) * scale;

    details[i].node.style.transform = 'scale(' + (1 - depth) + ') translate3d(' + dx + 'px, ' + dy + 'px, ' + depth + 'px)';
  }

}