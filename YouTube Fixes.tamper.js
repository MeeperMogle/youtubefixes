// ==UserScript==
// @name        YouTube Fixes
// @namespace   Mogle
// @include     http*://*.youtube.com/*
// @version     1.7.3.1
// £changes     1.7.3.1: Bugfix; Livestreams broke the latest feature.
// @changes     1.7.3: New feature, hide videos in the Subscriptions-list which are older than a certain number of days.
// @changes     1.7.2: Fixed a bug which made embedded videos useless, sorry about that.
// @changes     1.7.1.9: Watch-later buttons suddenly overlapped X buttons.
// @changes     1.7.1.8: YouTube changed stuff around again. Fixed.
// @changes     1.7.1.7: YouTube slightly changed structure of Subscriptions-page. Quick-fix for that.
// @changes     1.7.1.7: Fixed/added "Watch later"-button. Script previously broke it. Apologies.
// @changes     1.7.1.5: YouTube slightly changed structure of Subscriptions-page. Quick-fix for that.
// @changes     1.7.1.4: Quick-fix, some flaws in the last update.
// @changes     1.7.1.3: Video Ad-recognision structure was changed by YouTunbe - for the better! Quick-fix for Mute-compatibility.
// @changes     1.7.1.2: Subscriptions-video structure was changed by YouTube - again. Quick-fix for compatibility.
// @changes     1.7.1.1: Subscriptions-video structure was changed by YouTube. Quick-fix for compatibility.
// @changes     1.7.1: Changed Codepart 4: Playlist to calculate total Playtime since Total Views are no longer possible.
// @changes     1.7: (Beta) Show/hide Filter-box, improved Video Resizer + ESC to re-resize, widescreen Subscriptions-page, anti-videoad mute functionality (Beta).
// @changes     1.6.8: Had to push a graphical fix because of YouTube changing the layout. Experimenting with intelligent pause functionality.
// @changes     1.6.7: Bug fixes related to the Watch-page, including resize of HTML5-videos.
// @changes     1.6.6: Attempts to fix visual bug occurring for some.
// @changes     1.6.5: Performance increased. Enhanced Watched-detection.
// @changes     1.6.3: Minor fixees. Deleted deprecated code; can be found in old versions.
// @changes     1.6.2.1: Broke Spacebar so you couldn't comment. Whoops... Fixed it!
// @changes     1.6.2: Bound Enter and Spacebar to always Play/Pause the video (no scrolling on Spacebar). The work of commenting the code has begun!
// @changes     1.6.1: Some minor fixes to the previous additions.
// @changes     1.6: New feature: Define the width and height of the YouTube player! Also fixed broken "Uploaded X minutes ago".
// @changes     1.5: Checkboxes are remembered. Optional Regular Expression-based filtering added (beta function). Upgraded to JQuery 2.0.3
// @changes     1.2.2: Added LOAD ALL-button. Filter-list is now alphabetical.
// @changes     1.2.1: Fixes to hide Watched, since YouTube has changed some things.
// @changes     1.2: Increased performance, Watched-functionality.
// ==/UserScript==

// CTRL+F to access parts of the code quickly:
// Codepart 1: Global stuff - Adds link to the Inbox to the header again, redirects to HTTPS...
// Codepart 2: Subscriptions page - Adds all of the controls to the Subscriptions page
// Codepart 3: The Watch-page - Adds functionality for Watched-functionality, customize player size...
// Codepart 4: Playlist - Adds counter to the Playlist-pages that show the total time for all the videos in the playlist.



// Inserts code into the page including jQuery support
function doJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}


// ----------------------------------------------------------------------------------------------------
// Codepart 1: Global stuff - Adds link to the Inbox to the header again, redirects to HTTPS...
ctrlDown = false;
shiftDown = false;

fixesSettings = null;

function fixGlobal(){

    function loadFixesSettings(){
        fixesSettings = localStorage.getItem('ytfixes_settings');
        if(!fixesSettings){
            fixesSettings = {
                "annotations":false,
                "videoad_mute":false,
                "videoad_autopause":false,
                "autopause":false,
                "quality_status":false,
                "quality_value":"auto",
                "speed_status":false,
                "speed_value":100,
                "volume_status":false,
                "volume_value":100,
                "custom_size":true
            };
            localStorage.setItem('ytfixes_settings', JSON.stringify(fixesSettings));
        }
        else{
            fixesSettings = JSON.parse(fixesSettings); //make our string-item into an array
        }
    }
    loadFixesSettings();

    function saveFixesSettings(){
        localStorage.setItem('ytfixes_settings', JSON.stringify(fixesSettings));
        loadFixesSettings();
    }

    $('#masthead-expanded-menu-list').append('<li class="masthead-expanded-menu-item"><a href="/inbox" class="yt-uix-sessionlink" data-sessionlink="' + $('a.yt-uix-sessionlink').attr("data-sessionlink") + '">Inbox</a></li>');

    document.onkeyup = function(event){
        // CTRL
        if(event.which == 17){
            ctrlDown = false;
        }
        // Shift
        else if(event.which == 16){
            shiftDown = false;
        }
    };
    document.onkeydown = function(event){
        // CTRL
        if(event.which == 17){
            ctrlDown = true;
        }
        // Shift
        else if(event.which == 16){
            shiftDown = true;
        }
    };

    if(top.location.href.match(/youtube\.com/)){
        $("a[href*='watch?'], a[href*='feed'], a[href*='channel'], a[href*='subscription'], a[href*='playlist']").click(function(event){
            if( event.which == 1 ){
                var newURL = $(this).attr("href");

                if(ctrlDown || shiftDown){

                }
                else{
                    top.location=newURL;
                    window.location.href = newURL;
                    self.location=newURL;
                    window.navigate(newURL);
                    return false;
                }
            }
        });
    }

    setTimeout(function(){
        if(autoChooseAccount && location.href.match(/action_prompt_identity=true/)){

            $('.specialized-identity-prompt-account-item').each(function(){
                if($(this).html().indexOf(preferredAccount) > -1){
                    $(this).click();
                }
            });

            $('.yt-uix-form-input-radio').each(function(){
                if($(this).parent().parent().html().indexOf() > -1){
                    $(this).attr('checked', 'checked');
                }
            });
            $('#identity-prompt-confirm-button').click();
        }
        else if(autoChooseAccount && top.location.match(/youtube/) && $('#masthead-expanded-menu-account-info').children().eq(0).html() != preferredAccount){
            top.location = 'https://www.youtube.com/signin?next=%2F&action_prompt_identity=true&app=desktop';
        }
    },750);


    var settingsButton = "<span style='margin-right:5px;margin-top:2px;'><input type=button id=ytfixesSettingsButton value='YouTube Fixes'></span>";
    $('#yt-masthead-user').prepend(settingsButton);

    var settingsHeader = "YouTube Fixes Settings (UNDER DEVELOPMENT)";
    var settingsContent = "<table style=''>";
    //settingsContent+= "<tr><td class=ytfixesTD>Annotations</td><td class=ytfixesTD><input type=checkbox id=ytfixesAnnotations></td></tr>";
    settingsContent+= "<tr><td class=ytfixesTD>Custom video size</td><td class=ytfixesTD><input type=checkbox id=ytfixesCustomSize></td></tr>";
    settingsContent+= "<tr><td class=ytfixesTD>VideoAD mute</td><td class=ytfixesTD><input type=checkbox id=ytfixesVideoADmute></td></tr>";
    settingsContent+= "<tr><td class=ytfixesTD>VideoAD autopause+</td><td class=ytfixesTD><input type=checkbox id=ytfixesVideoADautopause></td></tr>";
    settingsContent+= "<tr><td class=ytfixesTD>Autopause++</td><td class=ytfixesTD><input type=checkbox id=ytfixesAutopause></td></tr>";
    settingsContent+= "<tr><td class=ytfixesTD>Quality**</td><td class=ytfixesTD>\<select id=ytfixesQuality>\
<option value='1080'>1080p (HD)</option>\
<option value='720'>720p (HD)</option>\
<option value='480'>480p</option>\
<option value='360'>360p</option>\
<option value='240'>240p</option>\
<option value='144'>144p</option>\
</select> <input type=checkbox id=ytfixesActivateQuality checked></td></tr>";
    // hd1080,hd720,large (480), medium (360), small (240), tiny (144)
    // getAvailableQualityLevels()
    // setPlaybackQuality(String)

    settingsContent+= "<tr><td class=ytfixesTD>Speed</td><td class=ytfixesTD>\<select id=ytfixesSpeed>\
<option value='0.25'>25%</option>\
<option value='.50'>50%</option>\
<option value='1' selected>100%</option>\
<option value='1.5'>150%</option>\
<option value='2'>200%</option>\
</select> <input type=checkbox id=ytfixesActivateSpeed checked></td></tr>"; // 0.25, 0.5, 1, 1.5, and 2.     setPlaybackRate(Number)      getAvailablePlaybackRates()
    settingsContent+= "<tr><td class=ytfixesTD>Volume**</td><td class=ytfixesTD><input type='number' min='0' max='100' value=100 id=ytfixesVolume> <input type=checkbox id=ytfixesActivateVolume checked></td></tr>"; // 0 - 100                    setVolume(Number)
    settingsContent+= "</table>";

    settingsContent+= "<br><br>* Beta\
<br>** <i>Forces</i> the closest (available) value\
<br>+ Video pauses when ad is done - fetch some coffee!\
<br>++ Stops video from autoplaying.";

    settingsContent+= "<br><br><b>Links</b>\
<br><a href=https://www.youtube.com/subscription_manager>Subscription manager</a>";    

    settingsContent+= "<br><br>Developer <input type=checkbox id=ytfixDevTestKitBox><br><div id=ytfixDevTestKit>\
<textarea id=checkStuffText cols=40></textarea> <button id=checkStuff>Execute</button></div>";

    $('#yt-masthead-user').append("<div id='ytfixesSettings' style='overflow:scroll;position:absolute;margin:10px 0 0 -70px;z-index:1000;width:350px;max-height:500px;padding:10px;background-color:white; border:2px solid black;'></div>");
    $('#ytfixesSettings').hide();

    $('#ytfixesSettings').append("<center><h1>" + settingsHeader + "</h1></center>_______________________________________________<br><br>" + settingsContent);

    $('.ytfixesTD').css('padding','5px');

    $("#ytfixesSettingsButton").click(function(){
        if($('#ytfixesSettings').css("display") != "block")
            $('#ytfixesSettings').show();
        else
            $('#ytfixesSettings').hide();
    });


    //$('#ytfixesSettings').show();

    // Annotations-box ----------------------------
    $('#ytfixesAnnotations').click(function(){
        if($(this).is(':checked')){
            fixesSettings.annotations = true;
        }
        else{
            fixesSettings.annotations = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.annotations){
        $('#ytfixesAnnotations').attr('checked',false);
    }
    else{
        $('#ytfixesAnnotations').attr('checked',true);
    }
    // End Annotations-box ----------------------------

    // Custom size-box ----------------------------
    $('#ytfixesCustomSize').click(function(){
        if($(this).is(':checked')){
            fixesSettings.custom_size = true;
        }
        else{
            fixesSettings.custom_size = false;
        }
        saveFixesSettings();

        if(!fixesSettings.custom_size){
            $('#autoUpdateSize, #customPlayerWidth, #customPlayerHeight, .resizeSpan').hide();
        }
        else{
            $('#autoUpdateSize, #customPlayerWidth, #customPlayerHeight, .resizeSpan').show();
        }
    });
    if(!fixesSettings.custom_size){
        $('#ytfixesCustomSize').attr('checked',false);
    }
    else{
        $('#ytfixesCustomSize').attr('checked',true);
    }
    // End Custom size-box ----------------------------

    // VideoADmute-box ----------------------------
    $('#ytfixesVideoADmute').click(function(){
        if($(this).is(':checked')){
            fixesSettings.videoad_mute = true;
        }
        else{
            fixesSettings.videoad_mute = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.videoad_mute){
        $('#ytfixesVideoADmute').attr('checked',false);
    }
    else{
        $('#ytfixesVideoADmute').attr('checked',true);
    }
    // End VideoADmute-box ----------------------------

    // VideoADautopause-box ----------------------------
    $('#ytfixesVideoADautopause').click(function(){
        if($(this).is(':checked')){
            fixesSettings.videoad_autopause = true;
        }
        else{
            fixesSettings.videoad_autopause = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.videoad_autopause){
        $('#ytfixesVideoADautopause').attr('checked',false);
    }
    else{
        $('#ytfixesVideoADautopause').attr('checked',true);
    }
    // End VideoADautopause-box ----------------------------

    // Autopause-box ----------------------------
    $('#ytfixesAutopause').click(function(){
        if($(this).is(':checked')){
            fixesSettings.autopause = true;
        }
        else{
            fixesSettings.autopause = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.autopause){
        $('#ytfixesAutopause').attr('checked',false);
    }
    else{
        $('#ytfixesAutopause').attr('checked',true);
    }
    // End Autopause-box ----------------------------





    // Quality-box ----------------------------
    $('#ytfixesActivateQuality').click(function(){
        if($(this).is(':checked')){
            $('#ytfixesQuality').attr("disabled",false);
            fixesSettings.quality_status = true;
        }
        else{
            $('#ytfixesQuality').attr("disabled",true);
            fixesSettings.quality_status = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.quality_status){
        $('#ytfixesActivateQuality').attr('checked',false);
        $('#ytfixesQuality').attr('disabled',true);
    }
    else{
        $('#ytfixesActivateQuality').attr('checked',true);
        $('#ytfixesQuality').attr('disabled',false);
    }
    // End Quality-box ----------------------------

    // Speed-box ----------------------------
    $('#ytfixesActivateSpeed').click(function(){
        if($(this).is(':checked')){
            $('#ytfixesSpeed').attr("disabled",false);
            fixesSettings.speed_status = true;
        }
        else{
            $('#ytfixesSpeed').attr("disabled",true);
            fixesSettings.speed_status = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.speed_status){
        $('#ytfixesActivateSpeed').attr('checked',false);
        $('#ytfixesSpeed').attr('disabled',true);
    }
    else{
        $('#ytfixesActivateSpeed').attr('checked',true);
        $('#ytfixesSpeed').attr('disabled',false);
    }
    // End Speed-box ----------------------------

    // Volume-box ----------------------------
    $('#ytfixesActivateVolume').click(function(){
        if($(this).is(':checked')){
            $('#ytfixesVolume').attr("disabled",false);
            fixesSettings.volume_status = true;
        }
        else{
            $('#ytfixesVolume').attr("disabled",true);
            fixesSettings.volume_status = false;
        }
        saveFixesSettings();
    });
    if(!fixesSettings.volume_status){
        $('#ytfixesActivateVolume').attr('checked',false);
        $('#ytfixesVolume').attr('disabled',true);
    }
    else{
        $('#ytfixesActivateVolume').attr('checked',true);
        $('#ytfixesVolume').attr('disabled',false);
    }
    // End Volume-box ----------------------------

    // Developer
    $('#checkStuff').click(function(){
        eval( $('#checkStuffText').val() );
    });

    $('#ytfixDevTestKit').hide();

    $('#ytfixDevTestKitBox').click(function(){
        if($(this).is(':checked')){
            $('#ytfixDevTestKit').show();
        }
        else{
            $('#ytfixDevTestKit').hide();
        }
    });
}
doJQuery(fixGlobal);

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





// ----------------------------------------------------------------------------------------------------


// Codepart 2: Subscriptions page - Adds all of the controls to the Subscriptions page
if(location.href.match(/feed\/(subscriptions|.*)/)){
    function initialStuff(){
        // Checkbox-settings
        var boxes = localStorage.getItem('boxes_hider'); //get list of hidden videos
        if(!boxes){
            //if not found, make it into an empty array
            boxes = {"hideWatched":true, "useRegex":false, "noOlderThan":"-"};
            localStorage.setItem('boxes_hider', JSON.stringify(boxes));
        }
        else{
            boxes = JSON.parse(boxes); //make our string-item into an array
        }

        if( $('#appbar-guide-menu').css('visibility') != 'visible'){
            $('#appbar-guide-menu, #appbar-guide-iframe-mask').css('display', 'none');
        }
        $('#appbar-guide-button').click(function(){
            if( $('#appbar-guide-menu').css('visibility') == 'visible'){
                $('#appbar-guide-menu, #appbar-guide-iframe-mask').css('display', 'none');
            }
            else{
                $('#appbar-guide-menu, #appbar-guide-iframe-mask').css('display', '');
            }
        });

        // Option to hide Recommended Channels
        $('#feed').parent().css("width","100%");
        $('#content').css("width","98.5%").css('margin-left','0px');



        var hideRecommended = localStorage.getItem('hide_recommended_hider'); //get list of hidden videos
        if(!hideRecommended){
            //if not found, make it into an empty array
            hideRecommended = "false";
            localStorage.setItem('hide_recommended_hider', hideRecommended);
        }

        var recommendedChannelsArea = $('.branded-page-v2-secondary-col').children().eq(0);
        recommendedChannelsArea.hide();
        recommendedChannelsArea.show();

        $('.branded-page-v2-secondary-col').prepend("<button style='margin:5px 0 -15px 10px; border: 1px solid grey; background-color: grey; cursor:pointer;' id=toggleRecommended>&gt;</button>");
        $('#toggleRecommended').click(function(){
            if(recommendedChannelsArea.css("display") == "block"){
                recommendedChannelsArea.hide();
                recommendedChannelsArea.parent().css("width", "1px").css("margin-left", "-30px");
                $(this).html( "&lt;" );
                localStorage.setItem('hide_recommended_hider', "true");
            }
            else{
                recommendedChannelsArea.show();
                recommendedChannelsArea.parent().css("width", "173px");
                $(this).html( "&gt;" );
                localStorage.setItem('hide_recommended_hider', "false");
            }
        });
        if( hideRecommended == "true" ){
            $('#toggleRecommended').html( "&lt;" );
            recommendedChannelsArea.hide();
            recommendedChannelsArea.parent().css("width", "1px").css("margin-left", "-30px");
        }



        $('.feed-item-main').css('margin','0');

        $('div.yt-lockup-description').remove();
        $('div.feed-header').remove();

        // Load all-button
        // Loads pages as far as possible, one at a time but without you having to keep clicking.
        //$('.feed-load-more-container').eq(0).html( $('.feed-load-more-container').eq(0).html()  + '<input type=submit value="LOAD ALL" id=loadALL>');
        $('#browse-items-primary').prepend('<center><input type=submit style="" value="LOAD ALL" id=loadALL></center>');



        $('#loadALL').click(function(){
            var r=confirm("Warning: Loading all videos will make the page run slow until it's done.\nPress OK to load, Cancel to abort.")
            if (r==true){
                var continues = true;
                checkInterval = setInterval(function(){
                    if(continues){
                        $('.load-more-button.yt-uix-load-more').eq(0).attr('id','loadsMore');

                        if( ($('.load-more-button').html() == undefined || $('.load-more-button').html() == "undefined") && $('#loadALL').parent().parent().parent().children().length == 2){
                            continues = false;
                            $('#loadALL,#loadsMore').hide();
                            clearInterval(checkInterval);
                        }
                        else{
                            document.getElementById('loadsMore').click();
                        }
                    }
                }, 2000);

                $('#loadALL').attr('disabled','disabled');
                $('#loadALL').attr('value','Loading all videos...');
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
        var daysFilter = 'Max <select id=noOlderThan><option value=->-</option></select> old';
        var seriesController = "<h2><span id=seriesControlTextareaHider style='color:grey;cursor:pointer;'></span></h2><textarea id=seriesControlTextarea cols=25 rows=4></textarea><br><input type=submit value=Filter id=seriesControlFilterButton style='margin-bottom:15px;'><hr color=black>";
        $('#behavior-id-guide-playlists-section').eq(0).prepend( hideWatchedBox + "<p><br>" + useRegexBox + "<p><br>" + daysFilter + "<p><br>" + unhideButton + "<p><br>" + seriesController );

        $('#seriesControlTextarea').hide();
        $('#seriesControlTextarea').show();

        for(i=0; i<=28;){
            if(i<7){
                $('#noOlderThan').append("<option value="+i+">"+i+" days</option>");
                i++;
            } else if(i==7){
                $('#noOlderThan').append("<option value="+i+">"+(i/7)+" week</option>");
                i+=7;
            } else {
                $('#noOlderThan').append("<option value="+i+">"+(i/7)+" weeks</option>");
                i+=7;
            }
        }



        $('#seriesControlTextarea').css('width','110%');
        $('#seriesControlTextarea').css('height','150px');
        $('#seriesControlTextarea').css('padding','0');
        $('#seriesControlTextarea').css('margin-left','-20px');
        $('#seriesControlTextarea').css('overflow','auto');

        var hideFilterbox = localStorage.getItem('hide_filterbox_hider'); //get list of hidden videos
        if(!hideFilterbox){
            //if not found, make it into an empty array
            hideFilterbox = "false";
            localStorage.setItem('hide_filterbox_hider', hideFilterbox);
        }

        if(hideFilterbox == "true"){
            $('#seriesControlTextarea, #seriesControlFilterButton').hide();
            $('#seriesControlTextareaHider').html("Videos to filter v");
        }
        else{
            $('#seriesControlTextareaHider').html("Videos to filter ^");
        }


        $('#seriesControlTextareaHider').click(function(){
            if($('#seriesControlTextarea').css("display") == "inline-block"){
                // hide
                $('#seriesControlTextarea, #seriesControlFilterButton').hide();
                $('#seriesControlTextareaHider').html("Videos to filter v");
                localStorage.setItem('hide_filterbox_hider', "true");
            }
            else{
                // show
                $('#seriesControlTextarea, #seriesControlFilterButton').show();
                $('#seriesControlTextareaHider').html("Videos to filter ^");
                localStorage.setItem('hide_filterbox_hider', "false");
            }
        });



        $('#whatIsRegex').click(function(){
            window.open("http://www.w3schools.com/jsref/jsref_obj_regexp.asp", '_blank');
            return false;
        });

        // Make the checkboxes correspond with the saved settings
        $('#hideWatched').prop('checked', boxes.hideWatched);
        $('#useRegex').prop('checked', boxes.useRegex);

        if(!boxes.noOlderThan){

            boxes.noOlderThan = '-';
            localStorage.setItem('boxes_hider', JSON.stringify(boxes));
        }
        document.getElementById('noOlderThan').value = boxes.noOlderThan;

        $('#noOlderThan').change(function(){
            boxes.noOlderThan = document.getElementById('noOlderThan').value;
            localStorage.setItem('boxes_hider', JSON.stringify(boxes));
            hideTheRightStuff();
        });


        //make our unhide-button clickable
        $('#clear_hidden_list').click(function(){
            localStorage.setItem('video_hider', "");
            hidden = [];
            hideTheRightStuff();
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
            hideTheRightStuff();
        });

        $('#browse-items-primary').parent().prepend("<table border=0 id=fixesTable><tr id=videoTR></tr></table>");

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

                        var watchLaterButton;

                        // Old layout
                        userLink = $(this).children('.feed-item-header').children('.feed-item-actions-line').children('.feed-item-owner').html();

                        // New, icon-based layout
                        userLink = "<a href='" + $(this).parent().children(".feed-author-bubble-container").children("a").attr("href") + "'>"
                        + $(this).parent().children(".feed-author-bubble-container").children("a").children("span").children("span").children("span").children("span").children("img").attr("alt") + "</a>";

                        // Even newer layout - what the fudge, beef?
                        userLink = $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-content').children('.yt-lockup-byline').html().replace("by "," ");

                        // They keep adding stuff...


                        $(this).children('.feed-item-header').remove();

                        //watchLaterButton = $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-thumbnail').children('span').children('button.addto-watch-later-button')[0].outerHTML;
                        $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-thumbnail').children('span').children('button.addto-watch-later-button').remove();
                        imageLink = $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-thumbnail').html();
                        titleLink = $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-content').children('.yt-lockup-title').html();
                        timeAgo = $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-content').children('.yt-lockup-meta').children('ul').children('li').eq(0).html();
                        
                        views =   $(this).children('.yt-lockup-dismissable').children('div.yt-lockup-content').children('.yt-lockup-meta').children('ul').children('li').eq(1).html();

                        if(views == undefined)
                            views = '<span class="yt-badge  yt-badge-live">Live now</span>';
                        
                        $('#videoTR').append( "<td>" + imageLink + titleLink + "<br>Uploaded " + timeAgo + userLink + "<br>" + views + "</td>" );
                        $(this).parent().parent().parent().parent().parent().parent().parent().parent().remove();

                        $('#videoTR td').css('width', '185px');
                        $('#videoTR td').css('height', '200px');
                        $('span.contains-addto').css('height', '100px');
                        $('#videoTR td').css('margin-left', '20px');
                        $('#videoTR td').css('margin-top', '10px');
                        $('#videoTR td').css('margin-bottom', '10px');
                        $('#videoTR td').css('float', 'left');

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

        waitForKeyElements ("div.yt-lockup.yt-lockup-video", testIt);

        function hideTheRightStuff(){
            if( !boxes.hideWatched )
                $('.customWatched').show();

            $('#videoTR td').each(function(){
                var alreadyHidden = false;

                if(boxes.noOlderThan != "-"){
                    try{
                        var timeString = $(this).html().substring($(this).html().indexOf("Uploaded")).match(/(Uploaded \d+ [a-zA-Z]+ ago)/)[0];
                        var notLive = true;
                    } catch(e){
                        var notLive = false;
                    }

                    if(notLive){
                        if(timeString.indexOf("minute") != -1){ // X minutes

                        } else if(timeString.indexOf("hour") != -1) { // X hours

                        } else if(timeString.indexOf("day") != -1) { // X days
                            var unitAgo = parseInt(timeString.split(" ")[1]);
                            if(unitAgo > parseInt(boxes.noOlderThan)){
                                $(this).hide();
                                alreadyHidden = true;
                            }
                        } else if(timeString.indexOf("week") != -1) { // X weeks
                            var unitAgo = parseInt(timeString.split(" ")[1]);
                            if(unitAgo > (parseInt(boxes.noOlderThan)/7)){
                                $(this).hide();
                                alreadyHidden = true;
                            }
                        } else { // don't even know...

                        }
                    }
                }

                if(!alreadyHidden){
                    var id = $(this).children("a.yt-uix-tile-link").attr('href').substr($(this).children("a.yt-uix-tile-link").attr('href').indexOf('=')+1); //get the ID

                    $(this).children().children().children().children().children().attr('src','//i1.ytimg.com/vi/'+id+'/mqdefault.jpg');

                    if($.inArray(id, hidden)!=-1 || $.inArray('/watch?v=' + id, hidden)!=-1 || false){
                        //remove the video if it's in our array of stuff to hide
                        $(this).hide();
                    } else if(  $(this).html().indexOf('watched-badge') > -1 || $.inArray(id, watchedVideos) != -1 || $(this).html().indexOf('watched-message') > -1  ){
                        // Watched looks
                        $(this).children('a').children('span').children('span').children('span').children('span').children('img').css('opacity', '0.2');
                        $(this).addClass('customWatched');

                        if($('#hideWatched').prop('checked')){
                            $(this).hide();
                        } else {
                            var title = $(this).children('a').eq(0).html();

                            for(var i=0; i<hiddenSeries.length; i++){
                                if( boxes.useRegex ){
                                    var regex = new RegExp(hiddenSeries[i], "gim");

                                    if( title.match(regex) ){
                                        $(this).hide();
                                        break;
                                    }
                                } else if( title.toLowerCase().indexOf(hiddenSeries[i].toLowerCase()) > -1 ){
                                    $(this).hide();
                                    break;
                                } else {

                                }
                            }
                        }
                    } else{
                        $(this).show();
                        // Get the title of the video
                        var title = $(this).children('a').eq(0).html();

                        // Hide the series
                        for(var i=0; i<hiddenSeries.length; i++){
                            if( boxes.useRegex ){
                                var regex = new RegExp(hiddenSeries[i], "gim");

                                if( title.match(regex) ){
                                    $(this).hide();
                                    break;
                                }
                            } else if( title.toLowerCase().indexOf(hiddenSeries[i].toLowerCase()) > -1 ){
                                $(this).hide();
                                break;
                            } else {

                            }
                        }
                    }

                    if( $(this).html().indexOf('&nbsp;X&nbsp;') == -1 ){
                        // Add Watch-later button
                        var watchLaterButton = '<button class="yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon addto-button video-actions spf-nolink hide-until-delayloaded addto-watch-later-button yt-uix-tooltip" type="button" onclick=";return false;" title="Watch Later" role="button" data-video-ids="'+id+'"><span class="yt-uix-button-icon-wrapper"><span class="yt-uix-button-icon yt-uix-button-icon-addto yt-sprite"></span></span></button>';

                        //add basic X button
                        $(this).append('<span class="hideButton""><b>&nbsp;X&nbsp;</b></span>' + watchLaterButton);

                        $('button.addto-watch-later-button').css('opacity','1').css('position','relative').css('right','').css('bottom','').css('margin','0 30 10px 35px');

                        var button = $('.hideButton', this);
                        button.css('cursor', 'pointer'); //change cursor icon when hovering
                        button.css('background-color', 'lightgrey').css('float','right').css('bottom','1px'); //make it easier to see

                        //make it clickable
                        button.click(function(){
                            hidden.push(id); //add ID to our array
                            localStorage.setItem('video_hider', hidden.join(':')); //store it
                            $(this).parent().hide(); //hide the video
                        });
                    }
                }


            });

            $("a[href*='watch?'], a[href*='feed'], a[href*='channel'], a[href*='subscription'], a[href*='playlist']").click(function(event){
                if( event.which == 1 ){
                    var newURL = $(this).attr("href");

                    if(ctrlDown || shiftDown){

                    }
                    else{
                        top.location=newURL;
                        window.location.href = newURL;
                        self.location=newURL;
                        window.navigate(newURL);
                        return false;
                    }
                }
            });
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
// ----------------------------------------------------------------------------------------------------

// Codepart 3: The Watch-page. Adds functionality for Watched-functionality, customize player size...
if (location.href.match(/watch\?/) ){
    window.scroll(0, 0);

    fullVideoPlayerSelector = '#player-api, .video-stream, .html5-main-video, video, .html5-video-content, #player';
    var lastAdOnTime = -1;

    var firstAdDone = false;
    var firstAdMuted = false;
    var lastAdMuted = false;
    var lastCheckTime = -1;
    var currentlyAd = false;
    var middleAdDone = false;

    var firstCheckDone = 0;

    var tempMeep = true;

    ytplayer = document.getElementById("movie_player");

    // Disable Captions
    function ytfixesDoSettings(){
        // Extra checks will go here once it gets optional
        $('div[tabindex="2400"]').eq(1).click();
    }
    //doJQuery(ytfixesDoSettings);

    lastState = "";
    doneInitial = 0;
    // 
    ytplayer.addEventListener('onStateChange', function(){
        if(doneInitial < 3){
            setTimeout(ytfixesDoSettings,1500);
            doneInitial++;
        }




        lastState = ytplayer.getPlayerState();
    });

    function spacebarToPause(){
        $(document).keydown(function(evt) {
            if ((evt.keyCode == 13 || evt.keyCode == 32) && document.activeElement.tagName.toLowerCase() != "textarea" && document.activeElement.tagName.toLowerCase() != "input") {
                ytplayer = document.getElementById("movie_player");
                ytplayer.blur();

                if( ytplayer.getPlayerState() == 1 )
                    ytplayer.pauseVideo();
                else if( ytplayer.getPlayerState() == 2 )
                    ytplayer.playVideo();

            }

            return !(evt.keyCode == 32 && document.activeElement.tagName.toLowerCase() != "textarea" && document.activeElement.tagName.toLowerCase() != "input");
        });
    }
    doJQuery(spacebarToPause);

    function lookOnReddit(){
        $("#action-panel-details").prepend( "<a target=_blank href='http://www.reddit.com/search?q=" + $("#eow-title").attr('title').replace(/'/, '').replace(/  /,' ') + "'>Search on Reddit</a>" );
    }
    doJQuery(lookOnReddit);

    function addChangePlayerSizeControls(){
        $('#theater-background').remove();

        var playerWidth;
        var playerHeight;
        var savedCustomSize = localStorage.getItem('savedCustomSize');

        if( !savedCustomSize ){
            playerWidth = $(fullVideoPlayerSelector).css('width').replace('px','');
            playerHeight = $(fullVideoPlayerSelector).css('height').replace('px','');
            savedCustomSize = playerWidth + ':' + playerHeight;
            localStorage.setItem('savedCustomSize', savedCustomSize);
        }
        else{
            playerWidth = savedCustomSize.split(':')[0];
            playerHeight = savedCustomSize.split(':')[1];
        }



        $('#eow-title').parent().parent().append( '<span class=resizeSpan>Resize video! Auto? <input type=checkbox id=autoUpdateSize> ' );
        $('#eow-title').parent().parent().append( '<input type=text id=customPlayerWidth size=3 value="' + playerWidth + '"> <span class=resizeSpan>x</span> <input type=text size=3 id=customPlayerHeight value="' + playerHeight + '"> <span class=resizeSpan>px</span>');
        $('#eow-title').parent().parent().append( ' <input type=submit id=customSizeSaveButton value="Save"> </span></p>' );
        $('#customSizeSaveButton').hide();


        if(!fixesSettings.custom_size){
            $('#autoUpdateSize, #customPlayerWidth, #customPlayerHeight, .resizeSpan').hide();
        }
        else{
            $('#autoUpdateSize, #customPlayerWidth, #customPlayerHeight, .resizeSpan').show();
        }

        setTimeout(function(){
            if(fixesSettings.custom_size){
                if($('.ytp-size-toggle-large').html() != undefined){
                    $('#watch7-sidebar').css('margin-top','0');
                    $('#player-api').css('float', 'none').css('margin', '0 auto');
                    $('#player').attr('class', 'watch-playlist-collapsed watch-medium');
                    $('.watch-small').css('max-width','')
                }


                $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
                $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
                $(fullVideoPlayerSelector).css('left', '0px');
                $('video').css("width","100%").css("height","100%");
            }
        }, 1500);

        setTimeout(function(){
            if(fixesSettings.custom_size){
                $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
                $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
                $(fullVideoPlayerSelector).css('left', '0px');
                $('video').css("width","100%").css("height","100%");
            }
        }, 2500);

        setTimeout(function(){
            if(fixesSettings.custom_size){
                $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
                $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
                $(fullVideoPlayerSelector).css('left', '0px');
                $('video').css("width","100%").css("height","100%");
            }
        }, 3500);

        $('#customPlayerWidth').keyup(function(){
            if( $('#autoUpdateSize').is(':checked') ){
                $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
                $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
                $(fullVideoPlayerSelector).css('left', '0px');
                $('video').css("width","100%").css("height","100%");
            }
            $('#customSizeSaveButton').show();
        });
        $('#customPlayerHeight').keyup(function(){
            if( $('#autoUpdateSize').is(':checked') ){
                $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
                $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
                $(fullVideoPlayerSelector).css('left', '0px');
                $('video').css("width","100%").css("height","100%");
            }
            $('#customSizeSaveButton').show();
        });
        $('#customSizeSaveButton').click(function(){
            $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
            $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
            $('video').css("width","100%").css("height","100%");

            savedCustomSize = $('#customPlayerWidth').val() + ':' + $('#customPlayerHeight').val();
            localStorage.setItem('savedCustomSize', savedCustomSize);

            $(this).hide();
        });
    }

    var adMention;
    firstPause = 0;
    function myPauseVideo(){
        if( ytplayer.getDuration() && (true || ytplayer.getPlayerState() != -1)){

            try{
                adMention = $('div.videoAdUi').html().indexOf("Ad :") > -1 || $('div.videoAdUi').html().indexOf("videoAdUiProgressBar") > -1;
            }
            catch(e){
                adMention = false;
            }

            if(adMention != undefined && adMention){
                if(lastAdOnTime != ytplayer.getCurrentTime() && fixesSettings.videoad_mute){
                    ytplayer.mute();
                }

                lastAdOnTime = ytplayer.getCurrentTime();
                adMention = false;
            }
            else if(lastAdOnTime != -1){
                lastAdOnTime = -1;

                if(fixesSettings.videoad_autopause){
                    ytplayer.pauseVideo();
                }
                ytplayer.unMute();

                ytfixesDoSettings();

                if(fixesSettings.custom_size){
                    $(fullVideoPlayerSelector).css('width', $('#customPlayerWidth').val() + 'px');
                    $(fullVideoPlayerSelector).css('height', $('#customPlayerHeight').val() + 'px');
                    $(fullVideoPlayerSelector).css('left', '0px');
                    $('video').css("width","100%").css("height","100%");
                }
            }
            else if(firstPause < 4){
                firstPause++;
                if(ytplayer.getPlayerState() != 2 && fixesSettings.autopause){
                    ytplayer.pauseVideo();
                    ytplayer.unMute();
                }

                // Don't want Annotations?
                // Activate Off-button
                if(!fixesSettings.annotations){
                    //alert($('.ytp-button:contains("Off")').html());
                }
                // Do want Annotations?
                // Activate On-button
                else{
                    //alert($('.ytp-button:contains("Off")').html());
                }
            }
        }
        $('body').css('overflow','auto');
        //setTimeout(myPauseVideo,600);
    }
    setInterval(myPauseVideo,500);
    //setTimeout(myPauseVideo,1500);

    // There is a known bug on YouTube where the video suddenly just stops, setting Current Time = Total Duration of the video...
    // This function adds a Reload-button which reloads the page - starting at the current time, so you don't have to manually go there!
    function setUpReloadButton(){
        $('#eow-title').parent().parent().append( "<input type=submit value='Reload video' style='margin-bottom:5px;' id=videoReloader>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" );
        $('#videoReloader').click( function(){
            ytplayer = document.getElementById("movie_player");
            hours = Math.floor( (ytplayer.getCurrentTime() / (60*60)) );
            minutes = Math.floor( ( (ytplayer.getCurrentTime()-(hours*60*60)) / 60) );
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

    // Fullscreen stuff testing
    function fullscreenShalntScrewWithSize(){
        $('.ytp-button-fullscreen-enter').click(function(){
            setTimeout(function(){
                $('video').css("width","100%").css("height","100%");

                $('*').keydown( function(event){
                    if(event.which == 27){
                        setTimeout(function(){
                            $('video').css("width","100%").css("height","100%");
                        },750);
                    }
                });
            },750);
        });

        $('video').dblclick(function(){
            setTimeout(function(){
                $('video').css("width","100%").css("height","100%");

                $('*').keydown( function(event){
                    if(event.which == 27){
                        setTimeout(function(){
                            $('video').css("width","100%").css("height","100%");
                        },750);
                    }
                });
            },750);
        });

        $('*').keydown( function(event){
            if(event.which == 27){
                setTimeout(function(){
                    $('video').css("width","100%").css("height","100%");
                },750);
            }
        });
    }

    doJQuery(setUpReloadButton);
    doJQuery(addChangePlayerSizeControls);
    doJQuery(fullscreenShalntScrewWithSize);
    doJQuery(watchedVideo);
}
// ----------------------------------------------------------------------------------------------------

// Codepart 4: Playlist. Adds counter to the Playlist-pages that show the total time for all the videos in the playlist.
if (location.href.match(/playlist\?/) ){

    function viewCountOnPlaylist(){
        var total = 0;

        var hours = 0;
        var minutes = 0;
        var seconds = 0;

        $('div.timestamp').each(function(){
            var time = $(this).html();
            var separators = time.match(/:/g).length;

            if(separators == 0){
                seconds += parseInt(time)
            } else if(separators == 1){
                minutes += parseInt(time.split(":")[0]);
                seconds += parseInt(time.split(":")[1]);
            } else if(separators == 2){
                hours += parseInt(time.split(":")[0]);
                minutes += parseInt(time.split(":")[1]);
                seconds += parseInt(time.split(":")[2]);
            } else{

            }
        });

        while(seconds >= 60){
            seconds -= 60;
            minutes++;
        }
        while(minutes >= 60){
            minutes -= 60;
            hours++;
        }

        $('.pl-header-details').eq(0).append("<li>Total time " + hours + ":" + minutes + ":" + seconds + "</li>");

    }

    doJQuery(viewCountOnPlaylist);
}
