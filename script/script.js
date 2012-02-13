$(document).ready(function() {
	var cur_label;
	var cur_col;
	var spotters = [10];

	// sets up default spotters
	init_spotters(spotters);

	// brings up modal with info of clicked cell
	$('button').click(function() {
		cur_label = $(this).parent().children('.tag-header');
		cur_col = $(this).parent().index();
		$('#name_header').text(cur_label.text());
		$('#modal-input').val(cur_label.text());
	});

	// changes column info according to modal
	$('.modal-footer .btn.primary').click(function() {
		var modal_input = $('#modal-input');
		cur_label.text(modal_input.val());

		spotters[cur_col].stop();
		spotters[cur_col] = new Spotter("twitter.search",
			{q:modal_input.val(), period:10},
			{buffer:true, bufferTimeout:1000});
		spotters[cur_col].tweets = [];

		registerTweets(spotters[cur_col], cur_col, modal_input.val());
		spotters[cur_col].start();

		$('.col' + cur_col).remove();

		$('#modal-from-dom').modal('hide');
	});

	// closes modal
	$('.modal-footer .btn.cancel').click(function() {
		$('#modal-from-dom').modal('hide');
	});

});

function init_spotters(spotters) {
	for (var i = 0; i < 10; i++) {
		var query = $('.tag-header')[i].textContent;

		spotters[i] = new Spotter("twitter.search",
			{q:query, period:10},
			{buffer:true, bufferTimeout:1000});
			
		spotters[i].query = query;
		spotters[i].tweets = [];
		spotters[i].maxtweets = Math.floor(0.1 * ($(document).height() - $('#info-row').height()));
			
		registerTweets(spotters[i], i, spotters[i].query);
		spotters[i].start();
	}
}

//  deals with incoming tweets
function registerTweets(s, i, query) {
	// var tweetarr = [];
	// var numtweets = 0;
	
	s.register(function(tweet) {
		var query = $('.tag-header')[i].textContent;
		if (s.query != query)
			return;

		// makes new  box representing tweet
		var new_tweetbox = $("<div class='tweetbox col" + i + "'>"+ tweet.text +"</div>");

		// if (i === 9)
			// new_tweetbox.addClass('last');
		// else
			// new_tweetbox.css('left', Math.floor(i*$(window).width()*0.1));
		
		// add tweet to our internal array		
		s.tweets.push(new_tweetbox);

		var dh = Math.round($(document).height() - 
			$('#info-row').height() - 10*s.tweets.length + 10);
		dh = $('#info-row').height();

		new_tweetbox.css('bottom', '1000px');
		// add tweetbox and slide it down to position
		new_tweetbox.appendTo($('.content')).animate({
			bottom: $('#info-row').height() + 10*s.tweets.length - 10 + 'px'
		}, 3000);

		var left = new_tweetbox.position().left;

		// register some rightedge stuff, so it doesn't go off the screen
		if (left + 310 > $(window).width()) {
			new_tweetbox.addClass('rightedge');

			// $('.rightedge:not(.last)').hover(function() {
			// 	var left = $(this).css('left');
			// 	$(this).css('left', '');
			// 	$(this).css('right', '0px');
			// },
			// function() {
			// 	$(this).css('right', '');
			// 	$(this).css('left', left + 'px');
			// 	// console.log($(this).css('left'));
			// });
		}

		// limit tweets to what can fit on the screen
		if (s.tweets.length > s.maxtweets) {
			lastTweet = s.tweets.shift();

			for (var j = 0; j < s.tweets.length - 1; j++) {
				s.tweets[i].animate({
					bottom: s.tweets[i].offset().bottom - 10 + 'px'
				}, 10);
			}

			lastTweet.slideDown(function() {
				lastTweet.remove();
			});
		}


	});
}