var mdmn = (function($){
    
    var m = {}; //module object
	
	var state = 'home';//current screen state. 'home' = empty screen only background video, 'index' = insights list, 'player' = playing selected insight video
	
	var player; // Main Video Player JQuery object
	var currentVideo=-1;//index of selected video
	var insights;//insights are the main work in progress videos
	
	var maxPlay = 2;//maximum number of random thumbs playing at the same time
	
	var backVideo; //html5 video for backgroundvideos
	var backSources = [];//Array with objects {mp4:String,webm:String}


    var overlay; //overlay png on top of background video
    var background; //background picture
    var canvas; //for transparency animation of video overlay
    var context2d; //canvas context
    
    $(document).ready( function(){
    
        
        backVideo = $( '#backVideo' );
        backVideo.bind('canplay',onBackVideoEvent);
        backVideo.bind('play',onBackVideoEvent);
        backVideo.bind('ended',onBackVideoEvent);
        
        $( '#backVideoList' ).children().each( function( i ){
            var o = {}
            o.mp4 = $(this).data('mp4');
            o.webm = $(this).data('webm');
            backSources.push(o);
        })
        
        backSources.sort(function() {return 0.5 - Math.random()})
       
        insights = $(".insight");
        insights.hide();
        insights.click( onInsight );
        
        insights.children('video').bind('canplay',onThumbEvent);
        insights.children('video').bind('ended',onThumbEvent);
        
        
        player = $('#insightPlayer');
        createSeek();
        player.children('.controls').first().children().hide()
        $("#insightPlayer .controls .play").click(onPlay);
        $("#insightPlayer").click(onVideoControl);
        var video = player.children('video').first();
        video.bind('canplay',onPlayerEvent);
        video.bind('play',onPlayerEvent);
        video.bind('pause',onPlayerEvent);
        video.bind('ended',onPlayerEvent);
        video.bind('waiting',onPlayerEvent);
        video.bind('timeupdate',onPlayerEvent);
        video.bind('error',onPlayerEvent);
    

        $(".menuItem").click( onMenuItem );
        
        overlay = $('#overlay')[0];
        background = $('#background')[0];
        
        $('#background').one('load',function(){ drawCanvas(1) } );
        $('#overlay').one('load',function(){ drawCanvas(1) } );
        
        canvas = $('canvas')[0];
        context2d = canvas.getContext('2d');
        
        nextBackVideo();
    
        
        $(window).resize(onResize);
        onResize(null);

        if(isIPad()){
          maxPlay = 0;
        }
        
    })
    
    function isIPad(){
       var ua= navigator.userAgent;
       return /iPad/i.test(ua);
       
    }
    
    function drawCanvas(alpha){
        
        context2d.clearRect(0,0,canvas.width,canvas.height);
        
        context2d.globalAlpha = alpha;
        context2d.drawImage( 
              background,0,0,canvas.width,canvas.height );
        
        context2d.globalAlpha =(1-alpha)*0.9;
        context2d.drawImage( 
              overlay,0,0,canvas.width,canvas.height );
          
    }
    
    function onResize(e){
        var w = $(window).width();
        var h = $(window).height();
        
        var ratio = w/h;
        
        w = parseInt(ratio < 16/9 ? w : h/9*16);
        w = Math.min( Math.max( w, 980 ), 1440 );
        
        h = parseInt( ratio > 16/9 ? h : w/16*9 );
        h = Math.min( Math.max( h,550 ), 810 );
        
        
        $('#content').css({
            width:w,
            height:h,
            left: Math.max(0, ( $(window).width()-w )*0.5 ),
            top: Math.max(0, ( $(window).height()-h )*0.5 ), });
        
   
         
        $('canvas').attr('width',w);
        $('canvas').attr('height',h);
        
        drawCanvas(backVideo[0].paused || backVideo[0].ended ? 1 : 0);
        
    }
    
    var _availableCount = 0;
    function onThumbEvent(e){
        var thumb = e.currentTarget;
        switch(e.type){
            case 'canplay':
                if(!isIPad()){
                    _availableCount++;
                    if(_availableCount <= maxPlay && state == 'index')
                        playRandomThumb();
                }
            break;
            case 'ended':
                playRandomThumb( thumb );
            break;
        }

    }
    
   
    function playRandomThumb(){
        var available = shuffleAvailableThumbs();
        if(!available)
            return;
        
        for(i=0;i<maxPlay;i++){
            if(i<available.length)
                available[i].play();
        }
         
    }
    
    function shuffleAvailableThumbs(){
       var available = $(".insight video").filter( function(i){
              return (this.readyState==4 || this.readyState==3 || this.ended) && this.paused;
       });
       
       if(available.length == 0)
          return null;
          
       available.sort(function() {return 0.5 - Math.random()})
       
       return available;
    }

   
    
    function onInsight(e){
        setVideo( insights.index( this ) );
    }
    
    
    function onPlayerEvent(e){
        var control = $(this).siblings(".controls").first();
        switch (e.type){
            case 'canplay':
                control.children('.seek').first().slider('option','max',this.duration);
            break;
            case 'play':
                control.children('.play').addClass("pause");
                control.children().show().delay(1000).fadeOut(400);
            break;
            case 'pause':
               control.children('.play').removeClass("pause");
               control.children().fadeIn(400);
            break;
            case 'ended':
                control.show();
                control.children('.play').removeClass("pause");      
            break;
            case 'timeupdate':
                if(this.readyState == 4)
                    seekUpdate(this,control)
            break;
            case 'error':
                //alert('error');
            break;
        }
    }

    function setVideo(i){
        
        if(i != currentVideo){
        
            var thumbSrc = insights.children('video')[0].currentSrc;
        
            var src = $(insights[i]).data('mp4');
            var video = player.children('video')[0];
            var sources = video.getElementsByTagName("source");
            sources[0].src = $(insights[i]).data('mp4');
            sources[1].src = $(insights[i]).data('webm');
            video.load();
        
            currentVideo = i;
        }
        
        setState('player');
        
        
        
    }
    
    function setState( name ){
        switch( name ){
            case 'home':
                showInsights(false);
                videoPlay(false);
            break;
            case 'index':
                showInsights(true);
                videoPlay(false);
                backVideo[0].play();
                $('#index')
                   .show()
                   .animate( { left:0 } );
                $('#insightPlayer')
                   .animate( { left:$('#content').width() } )
                   .hide(1);
                $('#ongoingon')
                   .animate( { top:'18%',left:'13%' } );
                $('#logo').fadeIn();
            break;
            case 'player':
                backVideo[0].pause();
                $('.insight')
                   .hide();
                videoPlay(true);
                $('#index')
                   .animate( { left:-1 * $('#content').width() } )
                   .hide(1);
                $('#insightPlayer')
                   .show()
                   .animate( { left:0 } );
                $('#ongoingon')
                   .animate( { top:'-20px',left:'-40px'} );
                $('#logo')
                   .fadeOut();
            break;
        }
        state = name;
    }
    
    function videoPlay(play){
        if(play)
            player.children('video')[0].play();
        else
            player.children('video')[0].pause();
    }
    
    
    function seekUpdate(video,$control){    
        $control.children('.seek').first().slider('value',video.currentTime);
    }
    
    function createSeek(){        
        var seek = player.find('.seek').first();
        seek.slider( {
			value: 0,
			step: 0.01,
			orientation: "horizontal",
			range: "min",
			max: player.children('video')[0].duration,
			animate: false,					
			slide: function(){
			    player.children('video')[0].pause();
			},
			stop:function(e,ui){
			    player.children('video')[0].currentTime=ui.value;
				player.children('video')[0].play();					
			}
		})
    }
    
    function onBackVideoEvent(e){
        var video = e.currentTarget;
        switch(e.type){
            case 'canplay':
                video.play();
                $( {globalAlpha:1} )
                    .animate(
                        { globalAlpha:0 },
                        { duration:3000, 
                          step: function(){ 
                              drawCanvas( this.globalAlpha ) 
                          }});
            break;
            case 'play':
                
            break;
            case 'ended':
                $( {globalAlpha:0} )
                    .animate(
                        { globalAlpha:1 },
                        { duration:3000, 
                          step: function(){ 
                              drawCanvas( this.globalAlpha ) 
                          }})
                    .delay(3000)
                    .queue( nextBackVideo );
            break;    
        }
    
    }
    
    var _currentBackVideo=-1;
    function nextBackVideo(){

        _currentBackVideo++;
        if(_currentBackVideo == backSources.length )
          _currentBackVideo = 0;
          
        var sources = backVideo[0].getElementsByTagName("source");
            sources[0].src = backSources[ _currentBackVideo ].mp4;
            sources[1].src = backSources[ _currentBackVideo ].webm;
        
        backVideo.load();

    }
    
   
    
    
    function onVideoControl(e){
        var vid = $(this).children("video")[0];
        var className = e.target.className;
        
        if(!vid.paused &&  (e.target.nodeName== "VIDEO" || className == "controls")){
            $(this).children(".controls").first().children().fadeToggle(400);
        }
    }
    
    function onMenuItem(e){
        var id = $(e.currentTarget).attr("id");
        switch(id){
            case "ongoingon":
                if(state == 'player')
                    setState('index')
                else if(state == 'index')
                    setState('home')
                else if(state == 'home')
                    setState('index')
            break;
        }
    }
    

    function showInsights(show){
        
        if(show){
            setTimeout(function(){ playRandomThumb() },400);          
        }
        else{
            $(".insight video").each( function(i){ 
                this.pause() 
            } );
        }
        
        insights.each( function(i){
            var left = i * 200;
            var x = Math.random() * 800 * (Math.random() > 0.5 ? -1 : 1);
            var y = Math.random() * 900 * (Math.random() > 0.5 ? -1 : 1);
            if(show){
                $(this).css( {top:x,left:y} );
                $(this).animate({top:0,left:0,opacity:'show'},400) 
            }
            else{
                
                $(this).animate({top:x,left:y,opacity:'hide'});
            }
        })
        
        
    }
    

    
    function onPlay(e){
        var vid = player.children('video')[0];
        if(vid.paused)
            vid.play();
        else
            vid.pause();
        
    }
    
    return m;
   
}(jQuery));