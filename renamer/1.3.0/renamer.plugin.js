//META{"name":"Renamer"}*//


class Renamer{
  constructor(){
		this.css = `<style class='renamer'>
		 .pick-wrap{position:relative;padding:0;margin:0;}
		 .pick-wrap .color-picker-popout{position:absolute;}
     .renamer-tag{ font-size: 10px;
     font-weight: 600;
     padding: 1px 2px;
     border-radius: 3px;
     text-transform: uppercase;
     vertical-align: bottom;
     line-height: 16px;
     flex-shrink: 0;}
     .channel-members .renamer-tag {line-height: 15px;height: 14px;}
     .chat .renamer-tag{margin-right:6px;}
		'</style>`;
		this.defaultSettings = { globals:{ "74822222203584512": {id: "74822222203584512", username: "🎮Mitchell🎮", discriminator: "5985", nick: "God King Emperor Mitchell", colour:"#FFD700", tag:{text: "2Cool", back: "green",fore: "#FFF"} } } }
		this.contextMarkup =
		`<div class="item-group renamer">
		  <div class="item name-item">
  			<span>Change Local Nickname</span>
  			<div class="hint"></div>
      </div>
      <div class="item tag-item">
  			<span>Change User Tag</span>
  			<div class="hint"></div>
		  </div>
		</div>`;
		this.colourList = ['rgb(26, 188, 156)','rgb(46, 204, 113)','rgb(52, 152, 219)','rgb(155, 89, 182)','rgb(233, 30, 99)','rgb(241, 196, 15)','rgb(230, 126, 34)',
				'rgb(231, 76, 60)','rgb(149, 165, 166)','rgb(96, 125, 139)','rgb(17, 128, 106)','rgb(31, 139, 76)','rgb(32, 102, 148)',
				'rgb(113, 54, 138)','rgb(173, 20, 87)','rgb(194, 124, 14)','rgb(168, 67, 0)','rgb(153, 45, 34)','rgb(151, 156, 159)','rgb(84, 110, 122)'];

  }
  getReactInstance(node){    return node[ Object.keys(node).find((key)=>key.startsWith("__reactInternalInstance"))]   }
  getReactObject(node){ return ((inst) => (inst._currentElement._owner._instance) )(this.getReactInstance(node)) }
  showTagModal(user){
    let { nick, username, colour ,tag } = ((user)=>user?user:{})(this.getNickname(user.id))
  	nick = nick?nick:user.username;
  	let custom,
  		selection = this.colourList.indexOf(colour);
      this.log(nick, username, colour)
  	let colorGroup =
  		`<div class="swatch large${colour?"":" selected"}" style="background-color: rgb(153, 170, 181);"></div><div class="swatch large custom" ${selection==-1?'style="background-color: rgb(255, 255, 255);"':''}></div>
  		<div class="regulars">`+this.colourList.map((val,i)=>`<div class="swatch${i==selection?" selected":""}" style="background-color: ${val};"></div>`).join("")+`</div>`
      let modal= $(`<span><div class="callout-backdrop renamer" style="background-color:#000; opacity:0.85"></div><div class="modal" style="opacity: 1">
          <div class="modal-inner">
              <form class="form">
                  <div class="form-header">
                      <header>Change User Tag</header>
                  </div>
                  <div class="form-inner">
                      <div class ="control-group preview chat"><div class="content"><strong>${nick}</strong></div></div>
                      <div class="control-group">
                          <label for="tagtext">
                              Tag Text
                          </label>
                          <input type="text" id="tagtext" name="text"${tag&&tag.text?"value=\""+tag.text+"\"":""}>
                      </div>
                      <div class="control-group">
                          <label class="reset-nick"><a>Delete Tag</a></label>
                      </div>
  					<div class="control-group">
  					  <label for="role-name">Nickname color</label>
  					  <div class="color-picker">
  						<div class="swatches">
  							${colorGroup}
  						</div>
  					  </div>
  					</div>
                  </div>
                  <div class="form-actions">
                      <button type="button" class="btn btn-default">Cancel</button>
                      <button type="submit" class="btn btn-primary">Save</button>
                  </div>
              </form>
          </div>
      </div></span>`).on("submit","form",(e)=>{
        e.preventDefault();
        const fore = ((c)=>(c[0]*0.299 + c[1]*0.587 + c[2]*0.114) > 186?"#000":"#FFF")($(".swatch.selected").css("backgroundColor").slice(4,-1).split(", "))
        const back = ((result)=>result=="rgb(153, 170, 181)"?"#7289da":result)($(".swatch.selected").css("backgroundColor"))
        this.setUserData(user,{tag:{
          text:e.target.elements.text.value,
          back: ((result)=>result=="rgb(153, 170, 181)"?"#7289da":result)($(".swatch.selected").css("backgroundColor")),
          fore: ((c)=>(c[0]*0.299 + c[1]*0.587 + c[2]*0.114) > 186?"#000":"#FFF")($(".swatch.selected").css("backgroundColor").slice(4,-1).split(", "))
        }});
        modal.remove();
      })
      .appendTo("#app-mount>:first-child")
  	  .on("click",".reset-nick",(e)=>{this.setGlobalNick(user,""); modal.remove() })
      .on("click",".callout-backdrop,button.btn-default",(e)=>{modal.remove()})
  	  .on("click",".swatch:not(.custom)",(e)=>{modal.find(".swatch.selected").removeClass("selected");e.target.classList.add("selected");custom.css("backgroundColor","")} )
  	  custom = $(".swatch.custom").spectrum({
  		  showInput:true,
  		  showButtons: false,
  		  move:(color)=>{$(".swatch.selected").removeClass("selected");custom.css("backgroundColor",color.toRgbString()).addClass("selected")}
  	  })
      modal.find("#nickname").click().focus();
  }
  showInputModal(user){
	let { nick, username, colour } = ((user)=>user?user:{})(this.getNickname(user.id))
	nick = nick?nick:user.username;
	let custom,
		selection = this.colourList.indexOf(colour);
    this.log(nick, username, colour)
	let colorGroup =
		`<div class="swatch large${colour==null?" selected":""}" style="background-color: rgb(153, 170, 181);"></div><div class="swatch large custom${selection==-1&&colour?" selected":""}" style="background-color:${selection==-1&&colour?colour:'rgb(255, 255, 255)'}"></div>
		<div class="regulars">`+this.colourList.map((val,i)=>`<div class="swatch${i==selection?" selected":""}" style="background-color: ${val};"></div>`).join("")+`</div>`
    let modal= $(`<span><div class="callout-backdrop renamer" style="background-color:#000; opacity:0.85"></div><div class="modal" style="opacity: 1">
        <div class="modal-inner">
            <form class="form">
                <div class="form-header">
                    <header>Change Local Nickname</header>
                </div>
                <div class="form-inner">
                    <div class="control-group">
                        <label for="nickname">
                            Nickname ${user.username}
                        </label>
                        <input type="text" id="nickname" placeholder="${user.username}" name="nick" value="${nick}">
                    </div>
                    <div class="control-group">
                        <label class="reset-nick"><a>Reset Nickname</a></label>
                    </div>
					<div class="control-group">
					  <label for="role-name">Nickname color</label>
					  <div class="color-picker">
						<div class="swatches">
							${colorGroup}
						</div>
					  </div>
					</div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-default">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div></span>`).on("submit","form",(e)=>{
      e.preventDefault();
      this.setUserData(user,{
        nick:e.target.elements.nick.value,
        color: ((result)=>result=="rgb(153, 170, 181)"?null:result)($(".swatch.selected").css("backgroundColor"))
      });
      modal.remove();
    })
    .appendTo("#app-mount>:first-child")
	  .on("click",".reset-nick",(e)=>{this.resetNickname(user.id); modal.remove() })
    .on("click",".callout-backdrop,button.btn-default",(e)=>{modal.remove()})
	  .on("click",".swatch:not(.custom)",(e)=>{modal.find(".swatch.selected").removeClass("selected");e.target.classList.add("selected");custom.css("backgroundColor","")} )
	  custom = $(".swatch.custom").spectrum({
		  showInput:true,
		  showButtons: false,
		  move:(color)=>{$(".swatch.selected").removeClass("selected");custom.css("backgroundColor",color.toRgbString()).addClass("selected")}
	  })
    modal.find("#nickname").click().focus();
  }
  getUpdates(){
    $.getJSON("https://megamit.github.io/repository/renamer/version.json",(data)=>{
      let version = this.getVersion().split(".")
      let latest = data[0].version.split(".")
      if (  latest[0] > version[0] || (latest[0] == version[0] && latest[1] > version[1]) || (latest[0] ==  version[0] && latest[1] == version[1] && latest[2] > version[2] )){
        let notice;
        notice = $(`<div class="notice"><div class="notice-dismiss"></div> Version ${latest.join(".")} of Renamer is available: ${data[0].notes} <a class="btn btn-primary" href="${data[0].src}" target="_blank">Download</a></div>`).on("click",".notice-dismiss",()=>notice.remove()).appendTo(".app")
      }
    })
  }
  resetNickname(id){
    delete this.settings.globals[id].nick;
  }
  setUserData(user,data){
	let  { nick, color, tag } = data;
  let  { username, discriminator, id } = user;
    if (this.settings.globals[id]){
      this.log(username, "has new nickname", nick)
      if (nick){
        this.settings.globals[id].nick = nick;
        this.settings.globals[id].colour = color
      }
      username && (this.settings.globals[id].username = username);
      discriminator && (this.settings.globals[id].discriminator = discriminator);
      if(tag){
        this.settings.globals[id].tag = tag;
        this.log(username, "has tag", tag)
      }
    }else{
      this.log(username, "is now", nick)
      this.settings.globals[id] = {
        id,
        username,
        discriminator,
      }
      if(nick){
       this.settings.globals[id].nick = nick;
       this.settings.globals[id].colour = color
     }
     if(tag){
       this.settings.globals[id].tag = tag;
     }
    }
    this.saveSettings();
    this.process(true);
  }
  log(){
  //  console.log("%c["+this.getName()+"]", 'font-weight: bold;color: green;' ,...arguments)
  }
  stop(){
		$('.renamer').remove();
	}
  start(){
    this.getUpdates()
    $(window)
    .on('keydown.renamer', (e)=> ((e.which==123) && eval('debugger')||true) );
    let contextmo = new MutationObserver( (changes,_) => {
      changes.forEach(
        (change,i) => {
          if(change.addedNodes)[...change.addedNodes].forEach((node)=>{
            if (node.nodeType==1&&node.className.includes("context-menu") ) this.onContextMenu( node )
          })
        }
      )
    } ),
      processmo = new MutationObserver( (changes,_) => {
        this.process()
      })
    this.waitForElement( "#app-mount>:first-child", (elem) => contextmo.observe( elem[0], {childList: true} ) )
    this.waitForElement( ".chat", (elem)=>processmo.observe( elem[0] , {childList:true, subtree: true} ))
    this.waitForElement( ".channel-members", (elem) => processmo.observe( elem[0] , {childList:true, subtree: true} ) )

    this.waitForElement(".channel-voice-states",(elem)=>processmo.observe( elem[0] , {childList:true, subtree: true} ))

		this.loadSettings()
		$('head').append(this.css+"<script src='https://bgrins.github.io/spectrum/spectrum.js'></script><link rel='stylesheet' href='https://bgrins.github.io/spectrum/spectrum.css' />");
    this.contextExtention = $(this.contextMarkup)

  }
  saveSettings(){
		localStorage.setItem(this.getName(),JSON.stringify(this.settings));
	}
	loadSettings(){
		this.settings = $.extend({},this.defaultSettings,JSON.parse(localStorage.getItem(this.getName())))
		this.saveSettings();
	}
  getNickname(id,channel){
    return this.settings.globals[id];
  }
  process(force){
    //chat names
    const start = Date.now()
    $(".chat strong.user-name"+(force?"":":not([renamer])")).each((i,el) => {
      //this.log(i,el);
      el.setAttribute("renamer","");
      let userData = this.getNickname( this.getReactObject(el).props.message.author.id )
      if (userData) {

        if (userData.tag) $("<span/>",{class:"renamer-tag",text:userData.tag.text}).css({color:userData.tag.fore,backgroundColor:userData.tag.back}).insertAfter(el)
        if(userData.nick) el.innerHTML = userData.nick;
        if(userData.colour) el.style.color = userData.colour;
      }
    }).attr("p")

    // member list names and voice chat names
    $(".channel-members .member-username-inner,.channel-voice-states .avatar-small+span"+(force?"":":not([renamer])")).each((i,el) => {
      el.setAttribute("renamer","");
      if (i>2000) return this.log("WHATTHEFUCK")
      let userData = this.getNickname( this.getReactObject(el).props.user.id )
      if (userData){
        if(userData.nick) el.innerHTML = userData.nick;
        if(userData.colour) el.style.color = userData.colour;
        //if (userData.tag) $("<span/>",{class:"renamer-tag",text:userData.tag.text}).css({color:userData.tag.fore,backgroundColor:userData.tag.back}).insertAfter(el)
      }
    })
    this.log("Process time:",Date.now()-start+"ms")
  }

  onContextMenu( context ){
    let inst = this.getReactInstance( context )
    if (!inst) return;
	this.log(inst._currentElement._owner._instance.props.type)
    switch (inst._currentElement._owner._instance.props.type) {
      case "USER_CHANNEL_MESSAGE":
      case "USER_CHANNEL_MEMBERS":
      case "USER_CHANNEL_MENTION":
      case "USER_PRIVATE_CHANNELS":
	  case "USER_PRIVATE_CHANNELS_MESSAGE":
        let { id, username, discriminator } = inst._currentElement._owner._instance.props.user;
        this.log(inst._currentElement._owner._instance.props.user)
        let data = { id, username, discriminator }
        $(context).append(this.contextExtention)
          .on("click.renamer",".name-item",data,this.onContextName.bind(this))
          .on("click.renamer",".tag-item",data,this.onContextTag.bind(this))
          //.on("click.renamer",".avatar-item",data,this.onContextAvatar.bind(this))
        break;
    }

    //this.log(this.getReactObject( context).props.type)
  }


  onContextName(e){
    $(e.delegateTarget).hide()
    //this.log("SetName",e.data);
    this.showInputModal(e.data)
  }
  waitForElement(css,callback){
    let obj = $(css),
    timer;
    if(obj.length){
      this.log("Element Present")
      callback(obj)
    }
    else {
      timer = setInterval(()=>{
        obj = $(css);
        if(obj.length){ this.log("Element Attached"); clearInterval(timer); callback(obj);  }
      },100)
    }
  }
  onContextAvatar(e){
    alert("Coming Soon")
    //$(e.delegateTarget).hide()
  }
  onContextTag(e){
    $(e.delegateTarget).hide();
    this.showTagModal(e.data);
  }
	getName(){return "Renamer"};
	getDescription(){return "Rename your friends"};
	getVersion(){return "1.3.0"};
	getAuthor(){return "Megamit/Mitchell"};

  //legacy
	load(){};
	unload(){};
}
