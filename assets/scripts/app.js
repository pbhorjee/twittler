
$(document).ready(function() {
    var userTweetsUser;

    //// utility stuff
    var $tweetStreamContainer = $('#tweet-stream');
    clearElement($tweetStreamContainer);

    var $userTweetContainer = $('#user-tweets');
    clearElement($userTweetContainer);

    var index = streams.home.length - 1;
    while (index >= 0) {
        var tweet = streams.home[index];
        appendTweet(tweet, $tweetStreamContainer);
        index -= 1;
    }

    function clearElement(container) {
        container.html('');
    }

    function appendTweet(tweet, $parent) {
        var $tweetContainer = $(document.createElement('div'));
        $tweetContainer.hide();

        if ($parent === $tweetStreamContainer) {
            var $tweetUser = $(document.createElement('div'));

            $tweetUser.text('@' + tweet.user);
            $tweetUser.addClass('user-link-clickable red');
            $tweetUser.on("click", function () {
                onUserClick(tweet.user);
            });
        }

        var $tweetText = $(document.createElement('div'));
        $tweetText.text(tweet.message);

        var $tweetTimeSpacer = $(document.createElement('span'));
        if ($parent === $tweetStreamContainer) {
            $tweetTimeSpacer.text(' - ');
            $tweetTimeSpacer.addClass('ital small-text')
        }

        var $tweetTime = $(document.createElement('span'));
        $tweetTime.text(moment(tweet.created_at).startOf('minute').fromNow());
        $tweetTime.addClass('date-time ital small-text');
        $tweetTime.data('create_at', tweet.created_at);

        $tweetContainer.append($tweetUser);
        $tweetContainer.append($tweetTimeSpacer);
        $tweetContainer.append($tweetTime);
        $tweetContainer.append($tweetText);

        $tweetContainer.prependTo($parent);
        $tweetContainer.fadeIn();

        if ($parent === $tweetStreamContainer && userTweetsUser === tweet.user) {
            appendTweet(tweet, $userTweetContainer)
        }

        updateUserTimes($parent);
    }

    //// always running
    function scheduleNextTweet(tweetContainer) {
        generateRandomTweet();
        appendTweet(streams.home[streams.home.length - 1], tweetContainer);

        var scheduleNext = function () {
            scheduleNextTweet(tweetContainer)
        };

        setTimeout(scheduleNext, Math.random() * 2500);
    };

    function updateUserTimes($tweetContainer, recurse) {
        recurse = recurse || false;
        var allTimes = $tweetContainer.find('.date-time');

        for (var t = 0; t < allTimes.length; t++) {
            var $time = $(allTimes[t]);
            var dt = $time.data('create_at');
            var newDtStr = moment(dt).startOf('minute').fromNow()
            var oldDtStr = $time.text();

            if (newDtStr !== oldDtStr) {
                $time.fadeOut(10);
                $time.text(newDtStr);
                $time.fadeIn(10);
            }
        }

        var updateTimes = function () {
            updateUserTimes($tweetContainer)
        };

        if (recurse) {
            setTimeout(updateTimes, 5000);
        }
    };


    //// timeout stuff -
    var updateTime = function ($container) {
        updateUserTimes($container, true);
        setTimeout(function () { updateTime($container) }, 5000);
    };

    setTimeout(scheduleNextTweet($tweetStreamContainer), Math.random() * 2500);
    setTimeout(function () { updateTime($userTweetContainer) }, 5000);
    setTimeout(function () { updateTime($tweetStreamContainer) }, 5000);


    ////  user interation stuff
    function onUserClick(user) {
        userTweetsUser = user;
        var userTweets = streams.users[user];

        clearElement($userTweetContainer);
        $('#user-name').html('Twittles from <span class="red">@' + user + "</span>");
        $('#show-none').show();

        for (var t in userTweets) {
            appendTweet(userTweets[t], $userTweetContainer)
        }
    }

    $('#show-mine').on("click", function () {
        onUserClick("you");
    });

    $('#show-none').on("click", function () {
        $(this).hide();
        userTweetsUser = '';
        clearElement($('#user-name'));
        clearElement($userTweetContainer);
    });


    ////  form stuff
    $('#tweetform').bind('keypress', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();

            return noSubmit();
        }
    });

    $('#tweetform').bind('keyup', function (e) {
        var tweetLength = $('#tweetform>#tweet').val().length;
        var $charLeft = $('#to-go');
        if (tweetLength > 0) {
            $charLeft.text(160 - tweetLength + ' left!')
            $charLeft.css("visibility", "visible")
        } else {
            $charLeft
                .css("visibility", "hidden");
        }
    });

    function noSubmit() {
        var tweet = writeTweet($('#tweetform>#tweet').val());
        appendTweet(tweet, $tweetStreamContainer);
        $('#tweetform>#tweet').val('');

        return false;
    }
});
