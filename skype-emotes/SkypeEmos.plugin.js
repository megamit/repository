//META{"name":"SkypeEmos"}*//

/*
	||TODO LIST

		-Custom Emotes
		-Server Emote List?
		-Big Skype emotes
		-Update for Latest BetterDiscord.
*/

/*
	||DONE List
		-CSS work to bypass the issue in the Emote Menu: Done Somewhat.
		-Emote Caching
*/

function SkypeEmos() {}

SkypeEmos.settingsButton = null;
SkypeEmos.settingsPanel = null;
SkypeEmos.settings_lastTab = "";
SkypeEmos.speedMultiplier = 0.04;
SkypeEmos.prototype.settings_changeTab = function(tab) {

    SkypeEmos.settings_lastTab = tab;
    
    var controlGroups = $("#se-control-groups");
    $(".se-tab").removeClass("selected");
    $(".se-pane").hide();
    $("#" + tab).addClass("selected");   
    $("#" + tab.replace("tab", "pane")).show();
     
    switch(tab) {
        case "se-settings-tab":
        break;
    }
};

SkypeEmos.settings_updateSetting = function(checkbox) {    
		var cb = $(checkbox).children().find('input[type="checkbox"]');
		var enabled = !cb.is(":checked");
		var id = cb.attr("id");
		cb.prop("checked", enabled);
		SkypeEmos.settings[id] = enabled;
		SkypeEmos.prototype.saveSettings()
		console.log("id",enabled)
}

SkypeEmos.settings_construct = function() {

	SkypeEmos.settingsPanel = $("<div/>", {
		id: "se-pane",
		class: "settings-inner",
		css: {
			"display": "none"
		}
	});
		
	var settingsInner = '' +
	'<div class="scroller-wrap">' +
	'   <div class="scroller settings-wrapper settings-panel">' +
	'       <div class="tab-bar TOP">' +
	'           <div class="tab-bar-item se-tab" id="se-settings-tab" onclick="SkypeEmos.prototype.settings_changeTab(\'se-settings-tab\');">Settings</div>' +
	'       </div>' +
	'       <div class="se-settings">' +
	'' +
	'               <div class="se-pane control-group" id="se-settings-pane" style="display:none;">' + 
	'                   <ul class="checkbox-group">';
	
	for(var setting in  SkypeEmos.settingsArray) {
		var sett =  SkypeEmos.settingsArray[setting];
		var id = sett["id"];
		if(sett["implemented"]) {
			settingsInner += '' +
			'<li>' +
				'<div class="checkbox" onclick="SkypeEmos.settings_updateSetting(this);" >' +
					'<div class="checkbox-inner">' +
						'<input type="checkbox" id="'+id+ '" ' + (SkypeEmos.settings[id] ? "checked" : "") + '>' +
						'<span></span>' +
					'</div>' +
					'<span>' + setting + " - " + sett["info"] +
					'</span>' +
				'</div>' +
			'</li>';
		}
	}
	settingsInner += '</ul>' +
		'               </div>' +
		'		</div>'+
		'	</div>'+
		'</div>'
	
	function show_Settings() {
		$(".tab-bar-item").removeClass("selected");
		SkypeEmos.settingsButton.addClass("selected");
		$(".form .settings-right .settings-inner").hide();
		
		SkypeEmos.settingsPanel.show();
		if(SkypeEmos.settings_lastTab == "") {
			SkypeEmos.prototype.settings_changeTab("se-settings-tab");
		} else {
			SkypeEmos.prototype.settings_changeTab(SkypeEmos.settings_lastTab);
		}
	}
	
	SkypeEmos.settingsButton = $("<div/>", {
		class: "tab-bar-item",
		text: "Skype-Emos",
		id: "se-settings-new",
		click: function(event){event.stopImmediatePropagation();show_Settings()}
	});

	SkypeEmos.settingsPanel.html(settingsInner);

	function defer() {
		if($(".btn.btn-settings").length < 1) {
			setTimeout(defer, 100);
		}else {
			$(".btn.btn-settings").first().on("click", function() {

			function innerDefer() {
					if($(".modal-inner").first().is(":visible")) {

						SkypeEmos.settingsPanel.hide();
						var tabBar = $(".tab-bar.SIDE").first();
						
						$(".tab-bar.SIDE .tab-bar-item:not(#bd-settings-new)").click(function() {
							$(".form .settings-right .settings-inner").first().show();
							$("#se-settings-new").removeClass("selected");
							SkypeEmos.settingsPanel.hide();
						});
						var tabBarAttempts = 0;
						var tabBarSet = setInterval(function(){
							var bdtab = $("#bd-settings-new")
							tabBarAttempts++
							if( bdtab.length>0){
								clearInterval(tabBarSet);
								tabBar.append(SkypeEmos.settingsButton);
								$("#se-settings-new").removeClass("selected");
								bdtab.click(function() {
									$("#se-settings-new").removeClass("selected");
									SkypeEmos.settingsPanel.hide();
								});
								console.log("[SkypeEmos] Settings tab attached after "+tabBarAttempts+" tries")
								}
							},50);
						
						$(".form .settings-right .settings-inner").last().after(SkypeEmos.settingsPanel)
						$("#se-settings-new").removeClass("selected");
					} else {
						setTimeout(innerDefer, 100);
					}
				}
				innerDefer();
			});
		}
	}
	defer();
	
};
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
SkypeEmos.settingsArray = {
	"Enable Skype Emotes in Messages": { "id": "emote-enable", "info": "Enable Message Parsing","default":true, "implemented": true },
    "Show Skype Emo list":          { "id": "emote-list", "info": "Shows the Skype Emo list","default":true,"implemented": true },
    "Show Emo Names":             { "id": "emote-tooltip", "info": "Shows the Emo Names","default":true, "implemented": false  },
}
SkypeEmos.emotelist = {":cat_cleaning:":{"url":"https://i.gyazo.com/da52bad9d25dcf64f1e9cec667f22e26.gif","type":"gif"}};
SkypeEmos.isReady = false;

SkypeEmos.prototype.load = function() {
	function preloadImages() {
		if (!preloadImages.list) {
			preloadImages.list = [];
		}
		for (var emote in SkypeEmos.emotelist) {
			var img = new Image();
			img.onload = function() {
				var index = preloadImages.list.indexOf(this);
				if (index !== -1) {
					// remove image from the array once it's loaded
					// for memory consumption reasons
					preloadImages.list.splice(index, 1);
					if(preloadImages.list.length==0){
							console.log("[Skype-Emo] Emotes Preloaded")
					}
				}
			}
			preloadImages.list.push(img);
			img.src = SkypeEmos.emotelist[emote].url;
		}
		console.log("[Skype-Emos] Preloading "+preloadImages.list.length+" emote(s)")
	}
	$.getJSON("https://megamit.github.io/BetterDiscordSkypeEmotes/data/skypeemotedata.json", function(list){
		SkypeEmos.emotelist = list;
		SkypeEmos.isReady=true;
		preloadImages()
		console.log("[Skype-Emos] Ready");
		SkypeEmos.process();
	}).fail(function(xhr,status,error){
		console.log("[Skype-Emos] Error Loading emotelist '"+status+":"+error+"'. Using fallback");
		SkypeEmos.isReady=true;
		SkypeEmos.process();
	});
	$('head').append(
		'<style>'+
		'#s_emo_pane{display:flex; flex-direction: row; flex-wrap: wrap; justify-content: center;}'+
		'.s_emo_sprite{animation: play 1s steps(1) infinite; display:inline-block;}'+
		'.qsprite{animation: none;margin:10px; }'+
		'.qsprite:hover{animation: play 1s steps(1) infinite;}'+
		'.qsprite-wrapper{display:inline-block;}'+
		'.s_emo_sprite40 { width: 40px;  height: 40px;}'+
		'.s_emo_sprite20 { width: 20px;  height: 20px;}'+
		'@keyframes play {  from { background-position:  0 0; }  to { background-position:  0 100%; }}'+
		'</style>"'
	);
};
SkypeEmos.prototype.saveSettings = function(){
	localStorage.setItem("s_emo_settings",JSON.stringify(SkypeEmos.settings));
}
SkypeEmos.prototype.getDefaultSettings = function(){
	var new_settings = {}
	for(var setting in  SkypeEmos.settingsArray) {
		new_settings[SkypeEmos.settingsArray[setting]["id"]]=SkypeEmos.settingsArray[setting]["default"];
	}
	return new_settings;
}
SkypeEmos.prototype.unload = function() {
};

SkypeEmos.prototype.start = function() {
	SkypeEmos.settings=JSON.parse(localStorage.getItem("s_emo_settings"))||SkypeEmos.prototype.getDefaultSettings();
	SkypeEmos.prototype.saveSettings();
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutations, observer) {
	if(SkypeEmos.isReady&&SkypeEmos.settings["emote-enable"])SkypeEmos.process();
		// ...
	});
	var start_try = setInterval(function(){
		if(SkypeEmos.isReady)clearInterval(start_try);
		else return;
		
		var chat_tries = 0;
		var chat_retry = setInterval(function(){
				chat_tries++;
				$(".chat").each ( function () {
					console.log("[Skype-Emos] Chat listener attached after "+chat_tries+" tries")
					clearInterval(chat_retry);
					observer.observe (this, { childList: true, characterData: true, attributes: false, subtree: true });
				});
			},100);
			if(SkypeEmos.settings["emote-list"])SkypeEmos.emote_list_construct();
			
			SkypeEmos.settings_construct();
			console.log("[Skype-Emos] Started.")
	},100);
};

SkypeEmos.emote_list_construct = function() {
	var quick_tries = 0;
	var quick_retry = setInterval(function(){
		quick_tries++;
		var quick_tabs = $(".emote-menu-tab");
		if(quick_tabs.length>1){
			console.log("[Skype-Emos] Quick tab inserted after "+quick_tries+" tries")
			clearInterval(quick_retry);
			$("#emote-menu-header").css("height","60px");
			$("#emote-menu>.scroller-wrap>.scroller").append(
				$("<div/>",{
					id: "s_emo_pane",
				}).hide()
			)
			$.each(SkypeEmos.emotelist,function(key,emote){
				$("#s_emo_pane").append(function(){
					if (emote.type == "sprite20"){
						var css_size = emote.steps-1;
						var duration = emote.steps*SkypeEmos.speedMultiplier;
						 return $("<div class = 'qsprite-wrapper' ></div>").append(
							$("<div class='qsprite s_emo_sprite20' style='animation-timing-function: steps("+css_size+"); animation-duration: "+duration+"s; background-image: url(\""+emote.url+"\") '></div>").click(function(){
								console.log(key);
								$(".channel-textarea-inner textarea").val($(".channel-textarea-inner textarea").val()+key);
							})
						 );
					}
				})
				
			})
			
			quick_tabs.click(function(){
				$("#s_emo_pane").hide();
				$("#s_emo_qtab").removeClass("emote-menu-tab-selected");
			}).last().after(
				$("<div/>",{
					id: "s_emo_qtab",
					class: "emote-menu-tab",
					text:"Skype"
				}).click(function(){
					$("#s_emo_pane").css("height", $(".emotemenu-open").height()-$("#emote-menu-header").height())
					$("#emote-menu>.scroller-wrap>.scroller>div").hide()
					$(".emote-menu-tab").removeClass("emote-menu-tab-selected");
					$("#s_emo_pane").show();
					$(this).addClass("emote-menu-tab-selected")
				})
			)
		}
	},100);
}
SkypeEmos.emote_list_deconstruct = function(){
		// Used to remove the Plugin Tab from the Quick Emote Menu.
	$("#s_emo_pane").remove();
	$("#s_emo_qtab").remove();
	$("#emote-menu-header").css("height","30px");
}

SkypeEmos.oldprocess = function() {
	$(".chat .comment .markup .message-content>span:not(.s_emos_scanned)").html(function(i,html){
		$.each(SkypeEmos.emotelist,function(key,emote){
			if(emote.type == "gif"){
				html = html.replaceAll(key, "<img src='" + emote.url+"'alt='"+key+"'><\/img>");
			}else if (emote.type == "sprite20"){
				var css_size = emote.steps-1;
				var duration = emote.steps*SkypeEmos.speedMultiplier;
				 html = html.replaceAll(key,"<div class='s_emo_sprite s_emo_sprite20' style='animation-timing-function: steps("+css_size+"); animation-duration: "+duration+"s; background-image: url(\""+emote.url+"\") '></div>")
			}else if (emote.type == "sprite40"){
				var css_size = emote.steps-1;
				var duration = emote.steps*SkypeEmos.speedMultiplier;
				 html = html.replaceAll(key,"<div class='s_emo_sprite s_emo_sprite40' style='animation-timing-function: steps("+css_size+"); animation-duration: "+duration+"s; background-image: url(\""+emote.url+"\") '></div>")
			}
		});
		return html
	}).addClass("s_emos_scanned");
}
SkypeEmos.process = function() {
	$(".message-content>span:not(.s_emos_scanned)").each(function(){
		var textnode = $(this).contents().filter(function() { return this.nodeType === 3; });
		var jtextnode = $(textnode);
		if (!jtextnode.html()){
			jtextnode.replaceWith(function(){
				var html = this.nodeValue;
				$.each(SkypeEmos.emotelist,function(key,emote){
					if(emote.type == "gif"){
						html = html.replaceAll(key, "<img src='" + emote.url+"'alt='"+key+"'><\/img>");
					}else if (emote.type == "sprite20"){
						var css_size = emote.steps-1;
						var duration = emote.steps*SkypeEmos.speedMultiplier;
						 html = html.replaceAll(key,"<div class='s_emo_sprite s_emo_sprite20' style='animation-timing-function: steps("+css_size+"); animation-duration: "+duration+"s; background-image: url(\""+emote.url+"\") '></div>")
					}else if (emote.type == "sprite40"){
						var css_size = emote.steps-1;
						var duration = emote.steps*SkypeEmos.speedMultiplier;
						 html = html.replaceAll(key,"<div class='s_emo_sprite s_emo_sprite40' style='animation-timing-function: steps("+css_size+"); animation-duration: "+duration+"s; background-image: url(\""+emote.url+"\") '></div>")
					}
				});
				return html
				})
		}
		}) .addClass("s_emos_scanned");
}
SkypeEmos.prototype.stop = function() {
	$(".s_emos_scanned>img").replaceWith("<span>"+$(this).attr("alt")+"</span>").removeClass(".s_emos_scanned");
	SkypeEmos.settingsButton.hide();
	SkypeEmos.emote_list_deconstruct();
	$("skype_plugin_css").remove()
	//End of Info to remove the Plugin things from the Quick Emote Window. Yes this reizes it just so that all of the emotes are seen like before.
	console.log("[Skype-Emos] Stopped.");
};

SkypeEmos.prototype.update = function() {
	console.log("[Skype-Emos] Updated");
};

SkypeEmos.prototype.getName = function() {
	return "Skype-Emos";
};

SkypeEmos.prototype.getDescription = function() {
	return "A plugin for BetterDiscord that brings some of the Skype Emos to Discord.";
};

SkypeEmos.prototype.getVersion = function() {
	return "1.0 Beta";
};

SkypeEmos.prototype.getAuthor = function() {
	return "megamit & Decorater";
};
