/**
 * @file MediaElement Playlist Feature (plugin).
 * @author Andrew Berezovsky <andrew.berezovsky@gmail.com>
 * Twitter handle: duozersk
 * @author Original author: Junaid Qadir Baloch <shekhanzai.baloch@gmail.com>
 * Twitter handle: jeykeu
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

(function($) {
  $.extend(mejs.MepDefaults, {
    loopText: 'Repeat On/Off',
    shuffleText: 'Shuffle On/Off',
    nextText: 'Next Track',
    prevText: 'Previous Track',
    playlistText: 'Show/Hide Playlist'
  });

  // LOOP TOGGLE
  MediaElementPlayer.prototype.buildloop = function(player, controls, layers, media) {
    var loop = $('<div class="mejs-button mejs-loop-button ' + ((player.options.loop) ? 'mejs-loop-on' : 'mejs-loop-off') + '">' +
      '<button type="button" aria-controls="' + player.id + '" title="' + player.options.loopText + '"></button>' +
      '</div>')
      // append it to the toolbar
      .appendTo(controls)
      // add a click toggle event
      .click(function(e) {
        player.options.loop = !player.options.loop;
        if (player.options.loop) {
          loop.removeClass('mejs-loop-off').addClass('mejs-loop-on');
          //media.setAttribute('loop', 'loop');
        }
        else {
          loop.removeClass('mejs-loop-on').addClass('mejs-loop-off');
          //media.removeAttribute('loop');
        }
      });
  };
  // SHUFFLE TOGGLE
  MediaElementPlayer.prototype.buildshuffle = function(player, controls, layers, media) {
    var shuffle = $('<div class="mejs-button mejs-shuffle-button ' + ((player.options.shuffle) ? 'mejs-shuffle-on' : 'mejs-shuffle-off') + '">' +
      '<button type="button" aria-controls="' + player.id + '" title="' + player.options.shuffleText + '"></button>' +
      '</div>')
      // append it to the toolbar
      .appendTo(controls)
      // add a click toggle event
      .click(function(e) {
        player.options.shuffle = !player.options.shuffle;
        if (player.options.shuffle) {
          shuffle.removeClass('mejs-shuffle-off').addClass('mejs-shuffle-on');
        }
        else {
          shuffle.removeClass('mejs-shuffle-on').addClass('mejs-shuffle-off');
        }
      });
  };
  // PREVIOUS TRACK BUTTON
  MediaElementPlayer.prototype.buildprevtrack = function(player, controls, layers, media) {
    var prevButton = $('<div class="mejs-button mejs-prevtrack-button mejs-prevtrack">' +
      '<button type="button" aria-controls="' + player.id + '" title="' + player.options.prevText + '"></button>' +
      '</div>')
      .appendTo(controls)
      .click(function(e){
        player.playPrevTrack();
      });
  };
  // NEXT TRACK BUTTON
  MediaElementPlayer.prototype.buildnexttrack = function(player, controls, layers, media) {
    var nextButton = $('<div class="mejs-button mejs-nexttrack-button mejs-nexttrack">' +
      '<button type="button" aria-controls="' + player.id + '" title="' + player.options.nextText + '"></button>' +
      '</div>')
      .appendTo(controls)
      .click(function(e){
        player.playNextTrack();
      });
  };
  // PLAYLIST BUTTON
  MediaElementPlayer.prototype.buildplaylist = function(player, controls, layers, media) {
    var playlistButton = $('<div class="mejs-button mejs-playlist-button ' + ((player.options.playlist) ? 'mejs-hide-playlist' : 'mejs-show-playlist') + '">' +
      '<button type="button" aria-controls="' + player.id + '" title="' + player.options.playlistText + '"></button>' +
      '</div>')
      .appendTo(controls)
      .click(function(e) {
        player.options.playlist = !player.options.playlist;
        if (player.options.playlist) {
          layers.children('.mejs-playlist').show();
          playlistButton.removeClass('mejs-show-playlist').addClass('mejs-hide-playlist');
        }
        else {
          layers.children('.mejs-playlist').hide();
          playlistButton.removeClass('mejs-hide-playlist').addClass('mejs-show-playlist');
        }
      });
  };
  
  // PLAYLIST WINDOW
  MediaElementPlayer.prototype.buildplaylistfeature = function(player, controls, layers, media) {
    var playlist = $('<div class="mejs-playlist mejs-layer">' +
      '<ul class="mejs"></ul>' +
      '</div>')
      .appendTo(layers);
    if (!player.options.playlist) {
      playlist.hide();
    }
    if (player.options.playlistposition == 'bottom') {
      playlist.css('top', player.options.audioHeight + 'px');
    }
    else {
      playlist.css('bottom', player.options.audioHeight + 'px');
    }
    var getTrackName = function(trackUrl) {
      var trackUrlParts = trackUrl.split("/");
      if (trackUrlParts.length > 0) {
        return decodeURIComponent(trackUrlParts[trackUrlParts.length-1]);
      }
      else {
        return '';
      }
    };

    // calculate tracks and build playlist
    var tracks = [];
    //$(media).children('source').each(function(index, element) { // doesn't work in Opera 12.12
    $('#'+player.id).find('.mejs-mediaelement source').each(function(index, element) {
      if ($.trim(this.src) != '') {
        var track = {};
        track.source = $.trim(this.src);
        if ($.trim(this.title) != '') {
          track.name = $.trim(this.title);
        }
        else {
          track.name = getTrackName(track.source);
        }
        tracks.push(track);
      }
    });
    for (var track in tracks) {
      layers.find('.mejs-playlist > ul').append('<li data-url="' + tracks[track].source + '" title="' + tracks[track].name + '">' + tracks[track].name + '</li>');
    }
    
    // set the first track as current
    layers.find('li:first').addClass('current played');
    // play track from playlist when clicking it
    layers.find('.mejs-playlist > ul li').click(function(e) {
      if (!$(this).hasClass('current')) {
        player.playTrack($(this).attr('data-url'));
        $(this).addClass('current played').siblings().removeClass('current');
      }
      else {
        player.play();
      }
    });

    player.playNextTrack = function() {
      var tracks = layers.find('.mejs-playlist > ul > li');
      var current = tracks.filter('.current');
      var notplayed = tracks.not('.played');
      if (notplayed.length < 1) {
        current.removeClass('played').siblings().removeClass('played');
        notplayed = tracks.not('.current');
      }
      if (player.options.shuffle) {
        var random = Math.floor(Math.random()*notplayed.length);
        var nxt = notplayed.eq(random);
      }
      else {
        var nxt = current.next();
        if (nxt.length < 1 && player.options.loop) {
          nxt = current.siblings().first();
        }
      }
      if (nxt.length == 1) {
        nxt.addClass('current played').siblings().removeClass('current');
        player.playTrack(nxt.attr('data-url'));
      }
    };
    player.playPrevTrack = function() {
      var tracks = layers.find('.mejs-playlist > ul > li');
      var current = tracks.filter('.current');
      var played = tracks.filter('.played').not('.current');
      if (played.length < 1) {
        current.removeClass('played');
        played = tracks.not('.current');
      }
      if (player.options.shuffle) {
        var random = Math.floor(Math.random()*played.length);
        var prev = played.eq(random);
      }
      else {
        var prev = current.prev();
        if (prev.length < 1 && player.options.loop) {
          prev = current.siblings().last();
        }
      }
      if (prev.length == 1) {
        current.removeClass('played');
        prev.addClass('current').siblings().removeClass('current');
        player.playTrack(prev.attr('data-url'));
      }
    };
    player.playTrack = function(url) {
      player.pause();
      player.setSrc(url);
      player.load();
      player.play();
    };
    // when current track ends - play the next one
    media.addEventListener('ended', function(e) {
      player.playNextTrack();
    }, false);
  };
})(jQuery);
