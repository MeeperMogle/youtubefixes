// ==UserScript==
// @name        YouTube Fixes
// @namespace   Mogle
// @include     http*://*.youtube.com/*
// @version     1.5
// @changes     1.5: Checkboxes are remembered. Optional Regular Expression-based filtering added (beta function). Upgraded to JQuery 2.0.3
// @changes     1.2.2: Added LOAD ALL-button. Filter-list is now alphabetical.
// @changes     1.2.1: Fixes to hide Watched, since YouTube has changed some things.
// @changes     1.2: Increased performance, Watched-functionality.
// ==/UserScript==

// Inserts code into the page including jQuery support
function doJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}

// Redirects you from HTTP to HTTPS
if (location.href.match(/http:/) ){
    var newUrl = location.href.replace("http://","https://");
    
    if(top.location==location.href){
        window.location.href = newUrl;
        window.navigate(newUrl);
        self.location=newUrl;
        top.location=newUrl;
    }
}

if (location.href.match(/redirect\?q=/) ){
    function redirectThrough(){
        top.location = $('#baseDiv p').eq(0).children('a').eq(0).html();
    }
    
    doJQuery(redirectThrough);
}

if(location.href.match(/feed\/subscriptions/)){
    function initialStuff(){
        // Checkbox-settings
        var boxes = localStorage.getItem('boxes_hider'); //get list of hidden videos
        if(!boxes){
            //if not found, make it into an empty array
            boxes = {"hideWatched":true, "useRegex":false};
            localStorage.setItem('boxes_hider', JSON.stringify(boxes));
        }
        else{
            boxes = JSON.parse(boxes); //make our string-item into an array
        }
        
        $('.feed-item-main').css('margin','0');
        
        $('div.yt-lockup-description').remove();
        $('div.feed-header').remove();
        
        $('#page').css('width','90%');
        $('#content').css('width','80%');
        
        $('.feed-load-more-container').eq(0).html( $('.feed-load-more-container').eq(0).html()  + '<input type=submit value="LOAD ALL" id=loadALL>');
        $('#loadALL').click(function(){
            var r=confirm("Warning: Loading all videos will make the page run slow until it's done.\nPress OK to load, Cancel to abort.")
            if (r==true){
                var continues = true;
                setInterval(function(){
                    if(continues){
                        $('.feed-load-more').eq(0).attr('id','loadsMore');
                        document.getElementById('loadsMore').click();
                        
                        if( $('.feed-load-more-container').attr('style') == 'display: none;' )
                            continues = false;
                    }
                }, 1000);
            }
        });
        
        $('#feed').prepend('<table border=0 cellpadding=5 cellspacing=0><tr id=videoTR></tr></table>');
        
        
        // Watched-patch
        var watchedVideos = localStorage.getItem('watched_hider'); //get list of hidden videos
        if(!watchedVideos){
            //if not found, make it into an empty array
            watchedVideos = ['21'];
        }
        else{
            watchedVideos = watchedVideos.split(':'); //make our string-item into an array
        }
        
        var hidden = localStorage.getItem('video_hider'); //get list of hidden videos
        if(!hidden){
            //if not found, make it into an empty array
            hidden = [];
        }
        else{
            hidden = hidden.split(':'); //make our string-item into an array
        }
        
        var hiddenSeries = localStorage.getItem('series_hider');
        if(!hiddenSeries){
            hiddenSeries = ["thing i don't watch", "boring thing", "uninteresting thing"];
        }
        else{
            hiddenSeries = hiddenSeries.split('||');
        }
        
        var hideWatchedBox = 'Hide Watched videos <input type=checkbox id=hideWatched>';
        var useRegexBox = 'RegEx in filters (<a href="" id=whatIsRegex>?</a>) <input type=checkbox id=useRegex>';
        var unhideButton = '<button id="clear_hidden_list" class="yt-uix-button">Show manually hidden videos</button>';
        var seriesController = "<h2>Videos to filter</h2><textarea style='margin-left:-30px' id=seriesControlTextarea cols=25 rows=4></textarea><br><input type=submit value=Filter id=seriesControlFilterButton>";
        $('#guide-subscriptions-section').eq(0).html( hideWatchedBox + "<p><br>" + useRegexBox + "<p><br>" + unhideButton + "<p><br>" + seriesController + $('#guide-subscriptions-section').html() );
        
        $('#whatIsRegex').click(function(){
        	window.open("http://www.w3schools.com/jsref/jsref_obj_regexp.asp", '_blank');
            return false;
        });
        
        // Make the checkboxes correspond with the saved settings
        $('#hideWatched').prop('checked', boxes.hideWatched);
        $('#useRegex').prop('checked', boxes.useRegex);
        
        
        
        //make our unhide-button clickable
        $('#clear_hidden_list').click(function(){
            localStorage.setItem('video_hider', "");
            //$(this).after('Done. Refresh page to see all videos.');
            hidden = [];
            hideTheRightStuff();
            //$(this).hide();
        });
        
        for(i=0; i<hiddenSeries.length; i++){
            $('#seriesControlTextarea').val( $('#seriesControlTextarea').val() + hiddenSeries[i] + "\n" );
        }
        
        $('#seriesControlFilterButton').click(function(){
            var eachEnteredThing = $('#seriesControlTextarea').val().split("\n");
            
            hiddenSeries = [];
            
            for(i=0; i<eachEnteredThing.length; i++){
                if(eachEnteredThing[i] != ""){
                    hiddenSeries.push(eachEnteredThing[i]);
                }
            }
            hiddenSeries.sort();
            localStorage.setItem('series_hider', hiddenSeries.join('||'));
            hideTheRightStuff()
        });
        
        
        // Base function supplied by http://stackoverflow.com/users/331508/brock-adams
        function waitForKeyElements (selectorTxt,actionFunction,bWaitOnce,iframeSelector){
            var targetNodes, btargetsFound;
            
            if (typeof iframeSelector == "undefined")
                targetNodes     = $(selectorTxt);
            else
                targetNodes     = $(iframeSelector).contents ()
                .find (selectorTxt);
            
            if (targetNodes  &&  targetNodes.length > 0) {
                targetNodes.each ( function () {
                    var jThis        = $(this);
                    var alreadyFound = jThis.data ('alreadyFound')  ||  false;
                    
                    if (!alreadyFound) {
                        var userLink;
                        var timeAgo;
                        var views;
                        var imageLink;
                        var titleLink;
                        
                        userLink = $(this).children('.feed-item-header').children('.feed-item-actions-line').children('.feed-item-owner').html();
                        timeAgo = $(this).children('.feed-item-header').children('.feed-item-time').html();
                        $(this).children('.feed-item-header').remove();
                        
                        imageLink = $(this).children('.feed-item-main-content').children('.yt-lockup').children('.yt-lockup-thumbnail').html();
                        titleLink = $(this).children('.feed-item-main-content').children('.yt-lockup').children('.yt-lockup-content').children('.yt-lockup-title').html();
                        views = $(this).children('.feed-item-main-content').children('.yt-lockup').children('.yt-lockup-content').children('.yt-lockup-meta').children('ul').children('li').eq(1).html();
                        
                        $('#videoTR').append( "<td style='width:185px;height:200px;margin-left:20px;margin-top:10px;margin-bottom:10px;float:left;'>" + imageLink + titleLink + "<br>" + timeAgo + " by " + userLink + "<br>" + views + "</td>" );
                        $(this).parent().parent().remove();
                        
                        hideTheRightStuff();
                        
                        jThis.data ('alreadyFound', true);
                    }
                } );
                btargetsFound   = true;
            }
            else {
                btargetsFound   = false;
            }
            
            var controlObj      = waitForKeyElements.controlObj  ||  {};
            var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
            var timeControl     = controlObj [controlKey];
            
            if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
                clearInterval (timeControl);
                delete controlObj [controlKey]
            }
            else {
                if ( ! timeControl) {
                    timeControl = setInterval ( function () {
                        waitForKeyElements (    selectorTxt, actionFunction, bWaitOnce, iframeSelector );
                    }, 500);
                    controlObj [controlKey] = timeControl;
                }
            }
            waitForKeyElements.controlObj   = controlObj;
        }
        
        function testIt(){
            
        }
        
        waitForKeyElements ("div.feed-item-main", testIt);
        
        function hideTheRightStuff(){
            $('#videoTR td').each(function(){
                var id = $(this).children("a.ux-thumb-wrap").attr('href').substr($(this).children("a.ux-thumb-wrap").attr('href').indexOf('=')+1); //get the ID
                
                if($.inArray(id, hidden)!=-1 || $.inArray('/watch?v=' + id, hidden)!=-1 || false){
                    //remove the video if it's in our array of stuff to hide
                    $(this).hide();
                }
                else if( ($('#hideWatched').prop('checked') && ($.inArray(id, watchedVideos) != -1) || $(this).html().indexOf('watched-message') > -1 ) ){
                    // Watched looks
                    $(this).children('a').children('span').children('span').children('span').children('span').children('img').css('opacity', '0.2');
                    $(this).addClass('customWatched');
                    $(this).hide();
                }
                    else{
                        $(this).show();
                        // Get the title of the video
                        var title = $(this).children('a').eq(1).html();
                        
                        // Hide the series
                        for(var i=0; i<hiddenSeries.length; i++){
                            if( boxes.useRegex ){
                                var regex = new RegExp(hiddenSeries[i], "gim");
                                
                                if( title.match(regex) ){
                                    $(this).hide();
                                    break;
                                }
                            }
                            else if( title.toLowerCase().indexOf(hiddenSeries[i].toLowerCase()) > -1 ){
                                $(this).hide();
                                break;
                            }
                        }
                        
                        if( $(this).html().indexOf('&nbsp;X&nbsp;') == -1 ){
                            //add basic X button
                            $(this).append('<span class="hideButton"><b>&nbsp;X&nbsp;</b></span>');
                            
                            var button = $('.hideButton', this);
                            button.css('cursor', 'pointer'); //change cursor icon when hovering
                            button.css('background-color', 'lightgrey').css('float', 'right').css('margin','0px 30px 30px 0px'); //make it easier to see
                            
                            //make it clickable
                            button.click(function(){
                                hidden.push(id); //add ID to our array
                                localStorage.setItem('video_hider', hidden.join(':')); //store it
                                $(this).parent().hide(); //hide the video
                            });
                        }
                    }
            });
            
            if( !boxes.hideWatched )
                $('.customWatched').show();
        }
        
        $('#hideWatched').mousedown(function() {
            if ($(this).is(':checked')) {
                // goes unchecked
                $('.customWatched').show();
                
                boxes.hideWatched = false;
            }
            else{
                // goes checked
                $('.customWatched').hide();
                
                boxes.hideWatched = true;
            }
            localStorage.setItem('boxes_hider', JSON.stringify(boxes) ); //store it
        });
        
        $('#useRegex').mousedown(function() {
            if ($(this).is(':checked')) {
                // goes unchecked
                boxes.useRegex = false;
            }
            else{
                // goes checked
                boxes.useRegex = true;
            }
            localStorage.setItem('boxes_hider', JSON.stringify(boxes) ); //store it
            hideTheRightStuff();
        });
        
        hideTheRightStuff();
    }
    doJQuery(initialStuff);
    
}

// On the Watch-page of a video, scroll down to the video
if (location.href.match(/watch\?/) ){
    window.scroll(55, 60);
    
    // There is a known bug on YouTube where the video suddenly just stops, setting Current Time = Total Duration of the video...
    // This function adds a Reload-button which reloads the page - starting at the current time, so you don't have to manually go there!
    function setUpReloadButton(){
        $('#eow-title').html( $('#eow-title').html() + "<br><input type=submit value='Reload video' id=videoReloader>" );
        $('#videoReloader').click( function(){
            ytplayer = document.getElementById("movie_player");
            hours = Math.floor( (ytplayer.getCurrentTime() / (60*60)) );
            minutes = Math.floor( (ytplayer.getCurrentTime() / 60) );
            seconds = Math.floor( (ytplayer.getCurrentTime() % 60) );
            
            baseURL = "https://www.youtube.com/watch?v=";
            
            // Thank you to http://stackoverflow.com/users/220819/jacob-relkin for this easy solution
            var video_id = window.location.search.split('v=')[1];
            var ampersandPosition = video_id.indexOf('&');
            if(ampersandPosition != -1) {
                video_id = video_id.substring(0, ampersandPosition);
            }
            
            top.location = baseURL + video_id + "&t=" + ( hours + "h" + minutes + "m" + seconds + "s" );
        });
    }
    
    // Create a custom Watched-system.
    function watchedVideo(){
        // Get watched videos
        var watchedVideos = localStorage.getItem('watched_hider'); //get list of hidden videos
        if(!watchedVideos){
            //if not found, make it into an empty array
            watchedVideos = ['21'];
        }
        else{
            watchedVideos = watchedVideos.split(':'); //make our string-item into an array
        }
        
        var video_id = window.location.search.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if(ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
        
        if( $.inArray(video_id,watchedVideos) == -1 ){
            watchedVideos.push(video_id); //add ID to our array
            localStorage.setItem('watched_hider', watchedVideos.join(':')); //store it
        }
        
    }
    
    doJQuery(setUpReloadButton);
    doJQuery(watchedVideo);
}

// Add Video Views on Playlist-page
// Rather than counting number of times the playlist was viewed,
// count the number of individual video views!
if (location.href.match(/playlist\?/) ){
    
    function viewCountOnPlaylist(){
        var total = 0;
        $('.header-stats:contains("video")').html($('.header-stats:contains("video")').html() + '<li><span class="stat-value" id=videoviews></span><span class="stat-name"> Video views</span></li></ul>');
        $('span.video-view-count').each(
            function(){
                total += parseInt($(this).html().replace(" ", "", 'g').replace("views","").replace(",","",'g').replace("No","0"));
            }
        );
        $('#videoviews').html(addCommas(total));
        
        function addCommas(nStr)
        {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
    }
    
    doJQuery(viewCountOnPlaylist);
}

// NOTE: THIS PART OF THE SCRIPT WAS DEPRECATED WITH THE OLD my_subscriptions PAGE!
// IT IS KEPT HERE IN CASE IT EVER RETURNS!
//
// Based on http://userscripts.org/scripts/show/120040 from WASDx
// Hide videos from your My Subscriptions-page (https://www.youtube.com/my_subscriptions),
// which is today the preferred page to visit rather than the bloated Feed (homepage)...
//
// News:
// - Instantly filter out videos based on their name
// - Instantly show all hidden videos
if (location.href.match(/my_subscriptions/) ){
    function main(){
        var hidden = localStorage.getItem('video_hider'); //get list of hidden videos
        if(!hidden){
            //if not found, make it into an empty array
            hidden = [];
        }
        else{
            hidden = hidden.split(':'); //make our string-item into an array
        }
        
        var hiddenSeries = localStorage.getItem('series_hider');
        if(!hiddenSeries){
            hiddenSeries = ["thing i don't watch", "boring thing", "uninteresting thing"];
        }
        else{
            hiddenSeries = hiddenSeries.split('||');
        }
        
        if(document.location.href.indexOf("my_subscriptions") != -1){
            // --- We are on my_subscriptions ---
            
            var seriesController = "<h2>Videos to filter</h2><textarea id=seriesControlTextarea cols=25 rows=4></textarea><br><input type=submit value=Filter id=seriesControlFilterButton>";
            $('#yt-admin-sidebar-hh.ytg-1col').eq(0).html( seriesController + $('#yt-admin-sidebar-hh').html() );
            
            $('#yt-admin-sidebar-hh.ytg-1col').eq(0).html( seriesController + $('#yt-admin-sidebar-hh').html() );
            
            guide-subscriptions-section
            
            for(i=0; i<hiddenSeries.length; i++){
                $('#seriesControlTextarea').val( $('#seriesControlTextarea').val() + hiddenSeries[i] + "\n" );
            }
            
            $('#seriesControlFilterButton').click(function(){
                var eachEnteredThing = $('#seriesControlTextarea').val().split("\n");
                
                hiddenSeries = [];
                
                for(i=0; i<eachEnteredThing.length; i++){
                    if(eachEnteredThing[i] != ""){
                        hiddenSeries.push(eachEnteredThing[i]);
                    }
                }
                
                localStorage.setItem('series_hider', hiddenSeries.join('||'));
                hideTheRightStuff()
            });
            
            hideTheRightStuff();
            function hideTheRightStuff(){
                $('#vm-playlist-video-list-ol li.vm-video-item').each(function(){
                    var id = $(this).attr('id').substr(9); //get the ID
                    
                    if($.inArray(id, hidden)!=-1 || false){
                        //remove the video if it's in our array of stuff to hide
                        $(this).hide();
                    }
                    else{
                        $(this).show();
                        // Get the title of the video
                        var title = $(this).children().eq(0).children().eq(0).children().eq(0).children().eq(0).html();
                        
                        // Hide the series
                        for(var i=0; i<hiddenSeries.length; i++){
                            if( title.toLowerCase().indexOf(hiddenSeries[i].toLowerCase()) > -1 ){
                                $(this).hide();
                            }
                        }
                        
                        if( $(this).html().indexOf('&nbsp;X&nbsp;') == -1 ){
                            //add basic X button
                            $(this).append('<span class="hideButton"><b>&nbsp;X&nbsp;</b></span>');
                            var button = $('.hideButton', this);
                            button.css('cursor', 'pointer'); //change cursor icon when hovering
                            button.css('background-color', 'lightgrey').css('float', 'right'); //make it easier to see
                            //make it clickable
                            button.click(function(){
                                hidden.push(id); //add ID to our array
                                localStorage.setItem('video_hider', hidden.join(':')); //store it
                                $(this).parents('li.vm-video-item').hide(); //hide the video
                            });
                        }
                    }
                });
            }
            
            //add button to unhide all
            $('#vm-playlist-copy-to').after(' <button id="clear_hidden_list" class="yt-uix-button">Unhide all manually hidden videos</button>');
        }
        else{
            
        }
        
        //make our unhide-button clickable
        $('#clear_hidden_list').click(function(){
            localStorage.setItem('video_hider', "");
            //$(this).after('Done. Refresh page to see all videos.');
            hidden = [];
            hideTheRightStuff();
            //$(this).hide();
        });
        
    }
    doJQuery(main);
}
