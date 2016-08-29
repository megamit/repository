//META{"name":"searchPlugin"}*//
class searchPlugin{
  constructor(){
		this.cancelFlag = false;
		this.css = "<style class='searchBarPlugin'>"+
		"#searchBarInner{"+
			"float:right; position:relative; height: 40px; bottom:40px;color:#FFF; padding: 0 4px; border-radius: 4px;"+
		'}'+
		'.buttonClose{'+
			'background: transparent url(https://discordapp.com/assets/14f734d6803726c94b970c3ed80c0864.svg); background-size: cover; transition: opacity .1s easeout; opacity: .5; width:12px; height: 12px; padding: 0'+
		'}'+
		'.buttonClose:hover{opacity:1;}'+
		'#searchBar{'+
			'height:0; width:auto;'+
		'}'+
		'#searchBar .btn{'+
			'cursor: pointer;'+
		'}'+
		'#searchBarInner>*+*{'+
			'margin-left:5px;'+
		'}'+

		'#searchBarInner>.buttonClose:last-child{'+
			'margin-left:30px;'+
		'}'+
		'#searchBarStopper{'+
			'width: auto; position: absolute; right: 0; top: -100%;'+
		'}'+
		'#searchBar input:not(:placeholder-shown)+.search-bar-clear:after,#searchBar input:not(:placeholder-shown)+.search-bar-clear:before{'+
		'	background:#373a3f;width:3px;height:14px;margin:6px 0 0 11px;'+
		'}'+
		'#searchBar input:not(:placeholder-shown)+.search-bar-clear{cursor:pointer;pointer-events:auto;}'+
		'</style>';
		this.defaultSettings = {"matchCase":false, "mentionsCheck":true, "namesCheck":true, "codeCheck":true, "searchTerm":""}
  }
  getUpdates(){
    $.getJSON("https://megamit.github.io/repository/search/version.json",(data)=>{
      let version = this.getVersion().split(".")
      let latest = data[0].version.split(".")
      if (  latest[0] > version[0] || (latest[0] == version[0] && latest[1] > version[1]) || (latest[0] ==  version[0] && latest[1] == version[1] && latest[2] > version[2] )){
        let notice;
        notice = $(`<div class="notice"><div class="notice-dismiss"></div> Version ${latest.join(".")} of Search is available: ${data[0].notes} <a class="btn btn-primary" href="${data[0].src}" target="_blank">Download</a></div>`).on("click",".notice-dismiss",()=>notice.remove()).appendTo(".app")
      }
    })
  }
  log(){
		var args = Array.prototype.slice.call(arguments);
		args.unshift("%c["+this.getName()+"]", 'font-weight: bold;color: green;');
		console.log.apply(console,args);
	}
  stop(){
		$('.searchBarPlugin').remove();
	}
  start(){
		this.loadSettings()
		window.addEventListener('keydown', (function(e){if(e.ctrlKey&&e.which==70){this.displaySearchbar()} }).bind(this) );
		$('head').append(this.css);
		this.getUpdates()
	}
  addStopper(){
		this.removeStopper()
		$("<div id='searchBarStopper' class='form'><button class='btn btn-primary red' type='button'><span>Stop Search</span></button></div>").insertBefore('#searchBarInner>*:last-child')
		.click(() => {
			this.stopSearch();
		})
	}
	removeStopper(){		$("#searchBarStopper").remove();	}
	containsCode(node){
		return ( node.nodeName=="PRE" && node.firstChild.nodeName == "CODE" || node.nodeName == "CODE" ) ;
	}
	containsMention(node){
		return false;
	}
	search(query_s,settings,startNode,startIndex){
    if (this.cancelFlag) return (this.cancelFlag = false)
    let { matchCase, mentionsCheck, namesCheck, codeCheck, direction } = settings,
      query = matchCase?query_s:query_s.toLowerCase(),
	    messages = $(".message-group.compact .message-content, .message-group:not(.compact) .markup"+
  		    // the span part is poor solution but i wont lose any sleep over it
  			(codeCheck?", .message-group.compact .message-content code, .message-group.compact .message-content code span, .message-group:not(.compact) .markup code, .message-group:not(.compact) .markup code span":"")+
  			(namesCheck?", .message-group.compact strong.user-name, .message-group:not(.compact) strong.user-name":"")+
  			(mentionsCheck?", .message-group.compact .message-content .highlight, .message-group:not(.compact) .markup .highlight":"")
  		)
  		.contents()
  		.filter(function() {
  			return this.nodeType === 3
  				//||( codeCheck && this.containsCode(this) )
  				;
  			}),
      foundStart = false,
		  found = false;
    let start, check, next;
    if (direction=="down"){
        start = 0;
        check = (i) => i<messages.length;
        next = (i) => i+1 ;
    } else {
        start = messages.length-1;
        check = (i) => i>=0;
        next = (i) => i-1;
    }
    let limit = 1000,
    msg;
		for (let i = start;check(i);i=next(i)){
			msg = messages[i];
			let msgtxt = matchCase?msg.nodeValue:msg.nodeValue.toLowerCase();
			if (!startNode||foundStart||startNode==msg){
				foundStart = true;
				if(startIndex==0&&startNode==msg) continue;
				let index = startNode==msg?msgtxt.lastIndexOf(query,startIndex-1):msgtxt.lastIndexOf(query)
				if (index!=-1){
					found=true
					$(".messages").scrollTop(msg.parentElement.offsetTop)
					let sel = window.getSelection();
					let range = document.createRange();
					let endpoint = query.length+index
					range.setStart(msg,0);
					range.setEnd(msg,endpoint);
					range.setStart(msg,index);
					sel.removeAllRanges();
					sel.addRange(range);
					//this.log("found",msg,msg.parentElement.offsetTop,"from",startNode,startIndex)
					break;
				}
			}
      if (limit-- ==0) return console.error("LIMIT BREAK",i,messages.length)
		}
		if (this.cancelFlag){
			//this.log("stop")
			this.cancelFlag = false;
		}
		if(found||this.cancelFlag){
			this.cancelFlag = false; this.removeStopper();
		}else{
			this.scrollChatToTop()
			this.cancelTO = setTimeout(() => {
				this.search(query,settings,msg,0)
			},50)
		}


	}
	scrollChatToTop(){
		$(".has-more button").click()
		$(".messages")[0].scrollTop=0;
	}
  scrollChatToBottom(){
		$(".has-more button").click()
		$(".messages")[0].scrollTop=0;
	}
	displaySearchbar(){
		if($("#searchBar").length==0){
			var sb = $("<form class='searchPlugin' id='searchBar'></form>").css("display","block")
			var sbInner = $("<div id='searchBarInner' class='search-bar'></div>").css("float","right")
			sb.append(sbInner)
			sbInner.append(
				$("<div class='search-bar-inner'></div>").append(
					$("<input id='searchBarInput' placeholder='Find...'>").keydown((event) => {
						if(event.keyCode == 13){
							event.preventDefault()
							$("#searchBarUp").click();
						}
					})
				).append(
					$(
					'<div class="search-bar-clear"></div>'
					).click(function(){
						this.previousSibling.value = "";
						this.previousSibling.focus();
					})
				)
			);
      const doSearch = (isDown) => {
				var q = $("#searchBarInput").val()
				if (q.length>0){
					var sel = window.getSelection();
					if (sel.type == "Range"&&sel.anchorNode.id != "searchBarForm"){
						$(".messages").scrollTop(sel.anchorNode.parentElement.offsetTop)
						this.addStopper();
						this.search($("#searchBarInput").val(),{
							matchCase: document.getElementById('searchBarCaseCheck').checked,
							mentionsCheck: document.getElementById('searchBarMentionsCheck').checked,
							codeCheck: document.getElementById('searchBarCodeCheck').checked,
							namesCheck: document.getElementById('searchBarNameCheck').checked,
              direction: isDown?"down":"up"
						},sel.anchorNode,sel.anchorOffset)

					}else{
						this.addStopper();
						this.search($("#searchBarInput").val(),{
							matchCase: document.getElementById('searchBarCaseCheck').checked,
							mentionsCheck: document.getElementById('searchBarMentionsCheck').checked,
							codeCheck: document.getElementById('searchBarCodeCheck').checked,
							namesCheck: document.getElementById('searchBarNameCheck').checked,
              direction: isDown?"down":"up"
						})
					}

				}
			}
			var up = $("<input id='searchBarUp' class='btn' type='button' value='&#x25B2'>").click(() => {doSearch(false)})
			sbInner.append(up);
			var down = $("<input id='searchBarDown' class='btn' type='button' value='&#x25BC'>").click(() => {doSearch(true)})
			sbInner.append(down);

			//var caseCheck = $("<input name='caseCheck' id='searchBarCaseCheck' class='btn' type='checkbox'>")
			var caseCheck = $('<div class="checkbox"><div class="checkbox-inner"><input id="searchBarCaseCheck" type="checkbox" '+(this.settings.matchCase?"checked":"")+'><span></span></div><span>Match Case</span></div>').click(function(){var x = document.getElementById('searchBarCaseCheck'); x.checked = !x.checked; this.settings.matchCase = x.checked; this.saveSettings();});
			var namesCheck = $('<div class="checkbox"><div class="checkbox-inner"><input id="searchBarNameCheck" type="checkbox"'+(this.settings.namesCheck?"checked":"")+'><span></span></div><span>Names</span></div>').click(function(){var x = document.getElementById('searchBarNameCheck'); x.checked = !x.checked; this.settings.namesCheck= x.checked; this.saveSettings();});
			var mentionsCheck = $('<div class="checkbox"><div class="checkbox-inner"><input id="searchBarMentionsCheck" type="checkbox"'+(this.settings.mentionsCheck?"checked":"")+'><span></span></div><span>Mentions</span></div>').click(function(){var x = document.getElementById('searchBarMentionsCheck'); x.checked = !x.checked;this.settings.mentionsCheck = x.checked; this.saveSettings();});
			var codeCheck = $('<div class="checkbox"><div class="checkbox-inner"><input id="searchBarCodeCheck" type="checkbox"'+(this.settings.codeCheck?"checked":"")+'><span></span></div><span>Code</span></div>').click(function(){var x = document.getElementById('searchBarCodeCheck'); x.checked = !x.checked; this.settings.codeCheck = x.checked; this.saveSettings();});
			//var caseLabel = $("<label for='caseCheck' id='searchBarCaseLabel' class='btn' type='checkbox'>Match Case</label>")
			sbInner.append(caseCheck)
			.append(namesCheck)
			.append(mentionsCheck)
			.append(codeCheck);
			//caseCheck.after(caseLabel);

			var closeX = $("<button id='searchBarClose' class='btn buttonClose' type='button'></button>").click( () => {
				this.stopSearch();
				$("#searchBar").remove();
			});
			sbInner.append(closeX);
			$(".messages-wrapper").after(sb)

		}
		$("#searchBarInput").focus();
	}
	stopSearch(){
		//this.log("stopping")
		clearTimeout(this.cancelTO)
		this.cancelFlag = true;
		this.removeStopper();
		setTimeout(function(){
			this.cancelFlag = false;
		},50)
	}

	saveSettings(){
		localStorage.setItem(this.getName(),JSON.stringify(this.settings));
	}
	loadSettings(){
		this.settings = $.extend({},this.defaultSettings,JSON.parse(localStorage.getItem(this.getName())))
		this.saveSettings();
	}

	getName(){return "searchPlugin"};
	getDescription(){return "The return of ctrl+f! until at least discord devs decide to add it"};
	getVersion(){return "1.2.1"};
	getAuthor(){return "Megamit/Mitchell"};
	load(){};
	unload(){};

}
