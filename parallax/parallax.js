document.addEventListener('DOMContentLoaded', initializeParallax);

function initializeParallax() {
  var containers = document.querySelectorAll('*[parallax-container]');
  var clip;
  for (var i = 0; i < containers.length; i++) {
    // Maybe optimize to not redo this for the same clip or iterate over clips
    // instead of containers.
    clip = findOverflowClip(containers[i]);
    clip.style.perspectiveOrigin = 'bottom right';
    clip.style.transformStyle = 'preserve-3d'
    clip.style.perspective = '1px';
  }
  var parallax = document.querySelectorAll('*[parallax]');
  clip.addEventListener('scroll', function() {
    for (var i = 0; i < parallax.length; i++) {
      var container = findContainer(parallax[i]);
      var threshold = 200;
      var visible = container.offsetTop - threshold - clip.clientHeight < clip.scrollTop &&
                    container.offsetTop + container.offsetHeight + threshold > clip.scrollTop;
      var display = visible ? 'block' : 'none'
      if (parallax[i].style.display != display)
        parallax[i].style.display = display;
    }
  });
  var parallaxDetails = [];
  for (var i = 0; i < parallax.length; i++) {
    parallax[i].style.position = 'absolute';
    parallax[i].style.transformStyle = 'preserve-3d';
    parallax[i].style.transformOrigin = 'bottom right';
    parallaxDetails.push({'node': parallax[i],
                          'height': parallax[i].offsetHeight});
  }
  window.addEventListener('resize', onResize.bind(null, parallaxDetails));
  onResize(parallaxDetails);
}

function onResize(details) {
  for (var i = 0; i < details.length; i++) {
    var container = findContainer(details[i].node);
    var overflowClip = findOverflowClip(details[i].node);
    var scrollbarWidth = overflowClip.offsetWidth - overflowClip.clientWidth; 
    var d2 = details[i].height - overflowClip.clientHeight;

    var depth = (details[i].height - container.offsetHeight) / d2;

    var scale = 1.0 / (1.0 - depth);

    // Ugh! The scrollbar is included in the 'bottom right' perspective origin!
    var dx = scrollbarWidth * (scale - 1);
    // Offset for the position within the container.
    var dy = (container.offsetHeight - details[i].height) * scale;

    details[i].node.style.transform = 'scale(' + (1 - depth) + ') translate3d(' + dx + 'px, ' + dy + 'px, ' + depth + 'px)';
  }
  
}

function findContainer(node) {
  while (node && !node.hasAttribute('parallax-container'))
    node = node.parentNode;
  return node;
}

function findOverflowClip(node) {
  while (node && getComputedStyle(node).overflow == 'visible')
    node = node.parentNode;
  return node;
}