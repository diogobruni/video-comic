var jsonVComic = false;

function vComicStartKit(kit) {
	vComic.setPlayer( jQuery('#vComicPlayer')[0] );

	var kitChaptersLength = kit.chapters.length;
	for( var i = 0; i < kitChaptersLength; i++) {
		var chapter = kit.chapters[i];
		vComic.addChapter(chapter);

		jQuery('[data-chapter-number='+ chapter.number +']').html(chapter.name);
	}

	var kitPausesLength = kit.pauses.length;
	for( var i = 0; i < kitPausesLength; i++) {
		var pause = kit.pauses[i];
		vComic.addPause(pause);
	}

	jQuery('.list-chapters .list-group-item').click(function() {
		var chapterNumber = jQuery(this).attr('data-chapter-number');
		vComic.seekChapter(chapterNumber);
	});

	vComic.on('end', function() {
		jQuery('.list-chapters .active').removeClass('active');
		jQuery('[data-chapter-number=0]', '.list-chapters').addClass('active');
	});

	vComic.on('chapterChange', function(chapter) {
		if ( chapter ) {
			var chapNum = chapter.number;
			jQuery('.list-chapters .active').removeClass('active');
			jQuery('[data-chapter-number='+ chapNum +']', '.list-chapters').addClass('active');
		}
	});

	vComic.start();
}

jQuery(function(){
	jQuery('.videoCover').click(function() {
		var player = jQuery('#vComicPlayer')[0];
		if ( player.paused ) {
			player.play();
		} else {
			player.pause();
		}
	});

	jQuery.ajax({
		url: 'vcomic.json',
		type: 'GET',
		dataType: 'JSON',
		success: function(data) {
			vComicStartKit(data);
		}
	});
});