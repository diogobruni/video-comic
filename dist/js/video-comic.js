Array.prototype.next = function() {
	if (!((this.index + 1) in this)) return false;
    return this[++this.index];
};
Array.prototype.prev = function() {
	if (!((this.index - 1) in this)) return false;
    return this[--this.index];
};
Array.prototype.current = function() {
	if (!((this.index) in this)) return false;
    return this[this.index];
};
Array.prototype.index = -1;
function Event(name){
	this.name = name;
	this.callbacks = [];
}
Event.prototype.registerCallback = function(callback){
	this.callbacks.push(callback);
}
 
function Reactor(){
	this.events = {};
}
 
Reactor.prototype.registerEvent = function(eventName){
	var event = new Event(eventName);
	this.events[eventName] = event;
};
 
Reactor.prototype.dispatchEvent = function(eventName, eventArgs){
	if ( typeof(this.events[eventName]) == 'undefined' ) return false;
	this.events[eventName].callbacks.forEach(function(callback){
		callback(eventArgs);
	});
};
 
Reactor.prototype.addEventListener = function(eventName, callback){
	this.events[eventName].registerCallback(callback);
};
function vComic() {
	var playerStates = {
			uninitialized: 0,
			playing: 1,
			paused: 2,
			stoped: 3
		};
	for( var i = 0; i < playerStates.length; i++ ) { 
		var code = playerStates[i];
		playerStates[code] = i;
	}

	var player = {
			dom: false,
			state: {
				code: playerStates.uninitialized,
				name: playerStates[ playerStates.uninitialized ]
			},
			chapter: false
		},

		chapters = [],
		timeEvents = [],
		listener = new Reactor();

	listener.registerEvent('chapterChange');
	listener.registerEvent('playerStateChange');
	listener.registerEvent('end');

	this.setPlayer = function(playerDom) {
		player.dom = playerDom;

		setPlayerEvents();
	}

	this.addChapter = function(chapterObj) {
		var lastChapterFileUrl = chapters.length && typeof(chapters[chapters.length]) != 'undefined' ? chapters[chapters.length].fileUrl : false;
		chapters.push({
			number: chapterObj.number,
			name: typeof(chapterObj.name) != 'undefined' ? chapterObj.name : false,
			time: typeof(chapterObj.time) != 'undefined' ? chapterObj.time : 0,
			fileUrl: typeof(chapterObj.fileUrl) != 'undefined' ? chapterObj.fileUrl : lastChapterFileUrl
		});
	}

	this.addPause = function(pauseObj) {
		timeEvents.push({
			type: 'pause',
			//chapterNumber: pauseObj.chapterNumber,
			fileUrl: pauseObj.fileUrl,
			time: pauseObj.time,
			handler: function() {
				pause();
			}
		})
	}

	this.start = function() {
		init();
	}

	this.on = function(event, callback) {
		switch(event) {
			case 'chapterchange':
			case 'chapterChange':
				listener.addEventListener('chapterChange', function() {
					callback(chapters.current());
				});
			break;

			case 'playerstatechange':
			case 'playerStateChange':
				listener.addEventListener('playerStateChange', function() {
					callback(player.state);
				});
			break;

			case 'end':
				listener.addEventListener('end', function() {
					callback();
				});
			break;
		}
	}

	this.seekChapter = function(chapNumber) {
		var iChapter = false;
		var chapsLength = chapters.length;
		for( var i = 0; i < chapsLength; i++ ) {
			var auxChapter = chapters[i];
			if ( auxChapter.number == chapNumber ) {
				iChapter = i;
				break;
			}
		}

		if ( iChapter !== false ) {
			nextChapter(iChapter, true);
		}
	};

	var init = function() {
		nextChapter();
	}

	var nextChapter = function(chapIndex, bSeek) {
		var chapter;
		if ( typeof(chapIndex) != 'undefined' ) {
			if ( chapters.index == chapIndex ) return false;
			chapters.index = chapIndex;
			chapter = chapters.current();
		} else {
			chapter = chapters.next();
		}

		if ( chapter ) {
			if ( !~player.dom.src.indexOf(chapter.fileUrl) ) {
				setPlayerSrc(chapter.fileUrl);
				initializeTimeEvents();
				bSeek = true;
			}

			if (bSeek) {
				playerSeek(chapter.time);
			}

			listener.dispatchEvent('chapterChange');
		} else {
			endOfContent();
		}
	}

	var setPlayerSrc = function(src) {
		player.dom.src = src;
	}

	var playerSeek = function(time) {
		player.dom.currentTime = time;
		play();
	}

	var initializeTimeEvents = function() {
		var currentChapter = chapters.current();
		if ( !currentChapter ) return false;

		var timeEventsLength = timeEvents.length;
		for( var i = 0; i < timeEventsLength; i++ ) {
			var timeEvent = timeEvents[i];
			if (
				timeEvent.fileUrl == currentChapter.fileUrl
				&& player.dom.currentTime < timeEvent.time
			) {
				jQuery(player.dom).on('timeupdate', timeUpdateEvent(timeEvent.handler, timeEvent.time));
			}
		}

		var chaptersLength = chapters.length;
		for( var i = 0; i < chaptersLength; i++ ) {
			var chapter = chapters[i];
			if ( chapter.fileUrl == currentChapter.fileUrl ) {
				jQuery(player.dom).on('timeupdate', timeUpdateEvent(timeUpdateChapterEvent, {
					time: chapter.time,
					chapIndex: i
				}));
			}
		}
	}

	var timeUpdateEvent = function(handler, args) {
		var wrapped = function() {
			var time = typeof(args) == 'number' ? args : args.time;
			if (this.currentTime >= time) {
				jQuery(this).off('timeupdate', wrapped);
				//return handler.apply(this, arguments);
				return handler(args);
			}
		}
    	return wrapped;
	}

	var timeUpdateChapterEvent = function(args) {
		nextChapter(args.chapIndex);
	}

	var endOfContent = function() {
		listener.dispatchEvent('end');
	}

	var setPlayerEvents = function() {
		player.dom.onplay = function() {
			setPlayerState(playerStates.playing);
		}

		player.dom.onpause = function() {
			setPlayerState(playerStates.paused);
		}

		player.dom.onended = function() {
			nextChapter();
		}

		player.dom.onseeking = function() {
			jQuery(player.dom).off('timeupdate');
		}

		player.dom.onseeked = function() {
			initializeTimeEvents();
		}
	}

	var play = function() {
		if ( player.state.code != playerStates.playing ) {
			player.dom.play();
		}
	}

	var pause = function() {
		if ( player.state.code != playerStates.paused ) {
			player.dom.pause();
		}
	}

	var setPlayerState = function(code) {
		player.state.code = code;
		player.state.name = playerStates[code];

		listener.dispatchEvent('playerStateChange');
	}
}

var vComic = new vComic();