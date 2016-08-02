//META{"name":"Renamer"}*//


class Renamer{
  constructor(){
		this.css = "<style class='renamer'>"+
		'</style>';
		this.defaultSettings = { globals:{ "74822222203584512": {id: "74822222203584512", username: "🎮Mitchell🎮", discriminator: "5985", nick: "God King Emperor Mitchell", colour:"#FFD700"} } }
    this.contextMarkup =
    `<div class="item-group renamer">
      <div class="item name-item">
        <span>Change Local Nickname</span>
        <div class="hint"></div>
      </div>

    </div>`;
  }
  getReactInstance(node){    return node[ Object.keys(node).find((key)=>key.startsWith("__reactInternalInstance"))]   }
  getReactObject(node){ return ((inst) => (inst._currentElement._owner._instance) )(this.getReactInstance(node)) }
  showInputModal(user){
	let nick = ((usr) => usr?usr.nick:user.username)(this.getNickname(user.id));
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
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-default">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div></span>`).on("submit","form",(e)=>{e.preventDefault(); this.setGlobalNick(user,e.target.elements.nick.value); modal.remove()})
      .appendTo("#app-mount>:first-child")
	  .on("click",".reset-nick",(e)=>{this.setGlobalNick(user,""); modal.remove() })
      .on("click",".callout-backdrop,button.btn-default",(e)=>{modal.remove()})
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
  setGlobalNick(user,nick){
	if (nick.trim().length==0) nick = user.username
    let { id, username } = user;
    if (this.settings.globals[id]){
      this.log(username, "has new nickname", nick)
      this.settings.globals[id].nick = nick;
      this.settings.globals[id].username = username;
    }else{
      this.log(username, "is now", nick)
      this.settings.globals[id] = {
        id,
        nick: nick,
        username
      }
    }
    this.saveSettings();
    this.process(true);
  }
  log(){ console.log("%c["+this.getName()+"]", 'font-weight: bold;color: green;' ,...arguments)}
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

    $(".chat strong.user-name"+(force?"":":not([renamer])")).each((i,el) => {
      //this.log(i,el);
      el.setAttribute("renamer","");
      let userData = this.getNickname( this.getReactObject(el).props.message.author.id )
      if (userData) el.innerHTML = userData.nick
    }).attr("p")

    // member list names and voice chat names
    $(".channel-members .member-username-inner,.channel-voice-states span"+(force?"":":not([renamer])")).each((i,el) => {
      el.setAttribute("renamer","");
      let userData = this.getNickname( this.getReactObject(el).props.user.id )
      if (userData) el.innerHTML = userData.nick
    })
  }

  onContextMenu( context ){
    let inst = this.getReactInstance( context )
    if (!inst) return;
    switch (inst._currentElement._owner._instance.props.type) {
      case "USER_CHANNEL_MESSAGE":
      case "USER_CHANNEL_MEMBERS":
      case "USER_CHANNEL_MENTION":
      case "USER_PRIVATE_CHANNELS":
        let { id, username, discriminator } = inst._currentElement._owner._instance.props.user;
        let data = { id, username, discriminator }
        $(context).append(this.contextExtention)
          .on("click.renamer",".name-item",data,this.onContextName.bind(this))
          //.on("click.renamer",".colour-item",data,this.onContextColour.bind(this))
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
  onContextColour(e){
    alert("Coming Soon")
  //  $(e.delegateTarget).hide()
  }
	getName(){return "Renamer"};
	getDescription(){return "Rename your friends"};
	getVersion(){return "1.1.2"};
	getAuthor(){return "Megamit/Mitchell"};

  //legacy
	load(){};
	unload(){};
}
