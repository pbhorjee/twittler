
$(document).ready(function() {
    var userTweetsUser;
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

    function onUserClick(user) {
        userTweetsUser = user;
        var userTweets = streams.users[user];

        clearElement($userTweetContainer);
        $('#user-name').text('Twittles from @' + user);

        for (var t in userTweets) {
            appendTweet(userTweets[t], $userTweetContainer)
        }
    }

    function onShowMine() {
        onUserClick("you");
    }

    function scheduleNextTweet(tweetContainer) {
        generateRandomTweet();
        appendTweet(streams.home[streams.home.length - 1], tweetContainer);
        removeTweet(tweetContainer.children().last());

        var scheduleNext = function () {
            scheduleNextTweet(tweetContainer)
        };

        setTimeout(scheduleNext, Math.random() * 2500);
    };

    function clearElement(container) {
        container.html('');
    }

    function removeTweet($node) {
        $node.remove();
    }

    function appendTweet(tweet, $parent) {
        var $tweetContainer = $(document.createElement('div'));
        $tweetContainer.hide();

        if ($parent === $tweetStreamContainer) {
            var $tweetUser = $(document.createElement('div'));
            $tweetUser.text('@' + tweet.user);
            $tweetUser.addClass('user-link');
            $tweetUser.addClass('user-link-clickable');
            $tweetUser.on("click", function () {
                onUserClick(tweet.user);
            });
        }

        var $tweetText = $(document.createElement('div'));
        $tweetText.text(tweet.message);

        var $tweetTime = $(document.createElement('div'));
        $tweetTime.text(moment(tweet.created_at).startOf('minute').fromNow());
        $tweetTime.addClass('date-time');
        $tweetTime.data('create_at', tweet.created_at);

        var $separator = $(document.createElement('p'));

        $tweetContainer.append($tweetUser);
        $tweetContainer.append($tweetText);
        $tweetContainer.append($tweetTime);
        $tweetContainer.append($separator);

        $tweetContainer.prependTo($parent);
        $tweetContainer.fadeIn();

        if ($parent === $tweetStreamContainer && userTweetsUser === tweet.user) {
            appendTweet(tweet, $userTweetContainer)
        }

        updateUserTimes($parent);
    }

    function updateUserTimes($tweetContainer, recurse) {
        recurse = recurse || false;
        var allTimes = $tweetContainer.find('.date-time');

        for (var t = 0; t < allTimes.length; t++) {
            var $time = $(allTimes[t]);
            var dt = $time.data('create_at');
            $time.text(moment(dt).startOf('minute').fromNow());
            $time.fadeOut(10).fadeIn(10);
        }

        var updateTimes = function () {
            updateUserTimes($tweetContainer)
        };

        if (recurse) {
            setTimeout(updateTimes, 5000);
        }
    };

    var updateTime = function ($container) {
        updateUserTimes($container, true);
        setTimeout(function () { updateTime($container) }, 5000);
    };

    $('#show-mine').on("click", function () {
        onShowMine()
    });

    setTimeout(scheduleNextTweet($tweetStreamContainer), Math.random() * 2500);
    setTimeout(function () { updateTime($userTweetContainer) }, 5000);
    setTimeout(function () { updateTime($tweetStreamContainer) }, 5000);

    $('#tweetform').bind('keypress', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();

            return noSubmit();
        }
    });

    function noSubmit() {
        var tweet = writeTweet($('#tweetform>#tweet').val());
        appendTweet(tweet, $tweetStreamContainer);
        removeTweet($tweetStreamContainer.children().last());
        $('#tweetform>#tweet').val('');

        return false;
    }
});
