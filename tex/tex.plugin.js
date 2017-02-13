//META{"name":"texPlugin"}*//
/*
Press CTRL + S to save this (probably some other key combo on a mac)

















*/
class texPlugin{
  getUpdates(){
    $.getJSON("https://megamit.github.io/repository/tex/version.json",(data)=>{
      let version = this.getVersion().split(".")
      let latest = data[0].version.split(".")
      if (  latest[0] > version[0] || (latest[0] == version[0] && latest[1] > version[1]) || (latest[0] ==  version[0] && latest[1] == version[1] && latest[2] > version[2] )){
        let notice;
        notice = $(`<div class="notice"><div class="notice-dismiss"></div> Version ${latest.join(".")} of Tex is available: ${data[0].notes} <a class="btn btn-primary" href="${data[0].src}" target="_blank">Download</a></div>`).on("click",".notice-dismiss",()=>notice.remove()).appendTo(".app")
      }
    })
  }
  start(){
	  // getUpdates()
	  BdApi.injectCSS('texplugin',`
	  .tex{
		font-family: courier;
		cursor: pointer;
		display: inline-block;
		position: relative;
		background-color: #111;
		outline: solid 4px #111;
		color: #eee;
		border-radius: 3px;
		box-sizing: border-box;
		transition: all .2s;
	  }
	  .tex img {
		display:none;
		margin: 4px auto;
		box-sizing: border-box;
		filter: invert(100%);
	  }
	  .tex.expand img {
		  display: block;
		  
	  }
	  `)
	  this.process()
  }
	process(){
		$(".message-group.compact .message-content:not([texplugin]), .message-group:not(.compact) .markup:not([texplugin])")
		.contents()
		.filter(function() {
			return this.nodeType === Node.TEXT_NODE;
		})
		.each((i, el) => {
			el.parentElement.setAttribute('texplugin',"");
			const match = el.data.match(/\$(.+)\$/)
			if (match){
				const range = document.createRange();
				range.setStart(el, match.index);
				range.setEnd(el, match.index + match[0].length);
				
				const wrapper = document.createElement('span');
				range.surroundContents(wrapper);
				wrapper.className = 'tex'
				const img = document.createElement('img');
				img.src = `https://latex.codecogs.com/gif.latex?${encodeURIComponent(match[1])}`
				wrapper.appendChild(img)
				wrapper.addEventListener('click', function(){
					$(wrapper).toggleClass('expand');
				})
				range.detach()
			}
		})
	}
	onMessage(){
		this.process()
	}
	onSwitch(){
		this.process()
	}
	getName(){return "texPlugin"};
	getDescription(){return "Turn text into Latext"};
	getVersion(){return "0.1.0"};
	getAuthor(){return "Megamit/Mitchell"};
	load(){};
	unload(){};

}
