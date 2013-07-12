// ==UserScript==
// @name        YouTube Fixes
// @namespace   Mogle
// @include     http*://*.youtube.com/*
// @version     1
// ==/UserScript==

// Inserts code into the page including jQuery support
function doJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js");
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

// On the Watch-page of a video, scroll down to the video
if (location.href.match(/watch\?/) ){
    window.scroll(55, 60);
    
    doJQuery(setUpReloadButton);
    
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
}

// Add Video Views on Playlist-page
// Rather than counting number of times the playlist was viewed,
// count the number of individual video views!
if (location.href.match(/playlist\?/) ){
    doJQuery(viewCountOnPlaylist);
    
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
}

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
            // --- We are on the front page ---
            
            // NOTE: Frontpage has been redone; this code no longer works!
            
            //loop through all videos in the subscription box
         //   $('div.feed-item-container').each(function(){
         //       var id = $('a.ux-thumb-wrap', this).attr('href'); //get the link
         //       id = id.substring(9,id.indexOf('&')); //convert link to video ID
         //       if($.inArray(id, hidden)!=-1){
                    //remove the video if it's in our array of stuff to hide
         //           $(this).parent("li").hide();
         //       }
         //       else{
                    //add basic X button
         //           $('h4', this).after(' <span class="hideButton"><b>&nbsp;X&nbsp;</b></span>');
         //           var button = $('.hideButton', this);
         //           button.css('cursor', 'pointer'); //change cursor icon when hovering
         //           button.css('background-color', 'lightgrey').css('float', 'right'); //make it easier to see
                    //make it clickable
         //           button.click(function(){ 
         //               hidden.push(id); //add ID to our array
         //               localStorage.setItem('video_hider', hidden.join(':')); //store it
         //               $(this).parents('div.feed-item-container').parent('li').hide(); //hide the video
         //           });
         //       }
         //   });
            
            //add button to unhide all
         //   $('.feed-container').append('<button id="clear_hidden_list" class="yt-uix-button">Unhide all videos</button>');
            
            //video thumbnails that are not visible on the screen are not loaded until you scroll down enough
            //but this addon may bring those thumbnails to the top of the page, showing empty thumbnails
            //the following code loads all thumbnails to prevent this bug
         //   $('div.feed-page img[data-thumb]').each(function(){
         //       var img = $(this).attr('data-thumb');
         //       $(this).attr('src', img);
         //   });
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
