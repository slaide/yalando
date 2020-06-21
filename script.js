var app=new Vue({
    el: "#outer",
    data:{
        stateEnums:{"load":0,"search":1,"person":2,"preference":3,"shoes":4},
        state: 0,
        searchPlaceholder: "search me",
        searchButtonText: "Search",
        searchExample:[
            "shoes for athletic men",
            "green shoes for a woman going on a business date",
            "id:AC8205"
        ],
        current_gender:{},
        genders:[
            {name:"Woman",src:"female.png",shoe_size:[6,12]},
            {name:"Adult",src:"neutral.png",shoe_size:[6,12]},
            {name:"Man",src:"male.png",shoe_size:[6,12]},
            {name:"Girl",src:"female.png",shoe_size:[1,5]},
            {name:"Child",src:"neutral.png",shoe_size:[1,5]},
            {name:"Boy",src:"male.png",shoe_size:[1,5]},
        ],
		user:{
			query:"",
			gender:{},
			preference:{},
			currency:'$',
			wishlist:[],
			wishlist_show:[],
			recommendations:[],
			queue:[],
		},
		preferences:[
			{name:"Review",description:"These shoes are described similarly by other users.",shoe_previews:[],randomized:false},
			{name:"Interaction",description:"These shoes are often on the same wishlist.",shoe_previews:[],randomized:false},
			{name:"Image",description:"These shoes look similar.",shoe_previews:[],randomized:false},
		],
		current_preference:{},
		current_shoe:{},
		recommend:true,
		blank_shoe:{id:"",name:"",price:"",price_text:"",bullets:[],words:[],src:"",click_text:{},real:false},
    },
    methods:{
        setSearchField:function(text){
            document.getElementById("search-field").value=text;
        },
        getSearchField:function(text){
            return document.getElementById("search-field").value;
        },
        resize:function(){
            document.body.style="--document-height:"+document.documentElement.clientHeight+"px;--document-width:"+document.documentElement.clientWidth+"px;";
        },
        setState(state){
            try{
				if(!this.stateEnums[state]) throw 'invalid state enum';

                this.state=this.stateEnums[state];

				if(this.state==this.stateEnums.person){
					for(const word of this.user.query.split(" ")){
						switch(word.toLowerCase()){
							case "wife":
							case "women":
							case "woman":{
								if(!this.user.gender.name) this.user.gender=this.genders[0];
								this.setState('preference');
								break;
							}
							case "husband":
							case "men":
							case "man":{
								if(!this.user.gender.name) this.user.gender=this.genders[2];
								this.setState('preference');
								break;
							}
							case "girl":
							case "girls":
              case "daughter":
              case "daughters":{
								if(!this.user.gender.name) this.user.gender=this.genders[3];
								this.setState('preference');
								break;
							}
							case "boy":
              case "boys":
              case "son":
              case "sons":{
								if(!this.user.gender.name) this.user.gender=this.genders[5];
								this.setState('preference');
								break;
							}
						}
					}
				}else if (this.state==this.stateEnums.preference){
					var sender=new XMLHttpRequest();
					sender.open('POST','/senduser',false);

					sender.onreadystatechange=function(){
						if(sender.readyState==XMLHttpRequest.DONE){
							if(sender.status>=200 && sender.status<400){
							    try{
    								const data=JSON.parse(sender.responseText);
									//console.log(data);
									const new_shoes=data.shoes;
									app.user.id=data.id;

  								app.preferences[0].shoe_previews=new_shoes.review;
  								app.preferences[1].shoe_previews=new_shoes.interaction;
  								app.preferences[2].shoe_previews=new_shoes.image;

  								app.preferences[0].randomized=new_shoes.randomized.review;
  								app.preferences[1].randomized=new_shoes.randomized.interaction;
  								app.preferences[2].randomized=new_shoes.randomized.image;

									//app.peekPreference(app.preferences[0]);
								}catch(e){
                  console.log(e.message);
    							let r=window.confirm("Invalid data from server received (either due to invalid input, or an internal error). Do you want to restart the search?");
                  if(r){
                    window.location.reload();
                  }
								}
							}
						}
					};

					sender.send(JSON.stringify(this.user));
				}else if(this.state==this.stateEnums.shoes){
					var sender=new XMLHttpRequest();
					sender.open('POST','/getshoes',false);

					sender.onreadystatechange=function(){
						if(sender.readyState==XMLHttpRequest.DONE){
							if(sender.status>=200 && sender.status<400){
							    try{
    								let shoes=JSON.parse(sender.responseText);

									for(let shoe of shoes){
										if(!shoe){
											Object.assign(shoe,app.blank_shoe);
										}else{
											shoe.click_text=app.blank_shoe.click_text;
											shoe.real=true;
										}
									}

									app.user.recommendations=shoes;

									app.setQueueRecommendations();

                  app.peekShoe(app.user.queue[0]);
								}catch(e){
    							let r=window.confirm("Invalid data from server received (either due to invalid input, or an internal error). Do you want to restart the search?");
                  if(r){
                    window.location.reload();
                  }
								}
							}
						}
					};

					sender.send(JSON.stringify({id:app.user.id,c:6,p:app.user.preference.name}));
				}
            }catch(e){
                console.log("state "+state+" not found",e);
            }
        },
		setQueueRecommendations:function(){
			this.user.queue=this.user.recommendations;
		},
		setQuery:function(){
			this.user.query=document.getElementById("search-field").value;
			if(this.user.query.length<1){
				window.alert("Search cannot be empty!");
			}else{
        let idsearch=false;
        let non_gender=false;
        const split_query=this.user.query.split(" ");
        for (const word of split_query){
          if (word.slice(0,3)=="id:"){
            idsearch=true;
          }
        }
        if (idsearch && split_query.length>1){
          window.alert("When searching for a specific id, no additional words are allowed!");
        }else if(idsearch){
  				this.setState('preference');
        }else{
  				this.setState('person');
        }
			}
		},
		peekGender:function(gender){
			if(this.current_gender){
				this.current_gender.hover=false;
			}
			this.current_gender=gender;
			gender.hover=true;
		},
		setGender:function(gender){
			this.user.gender=gender;
			this.setState('preference');
		},
		peekPreference:function(preference){
			for (i in this.preferences){
        this.preferences[i].focused=false;
			}

			this.current_preference=preference;
      preference.focused=true;
		},
		setPreference:function(preference){
			if(preference.name=="") return;
			this.user.preference=preference;

			this.setState('shoes');
		},
		peekShoe:function(shoe,ev){
			if(!shoe || shoe.name.length==0)return;
			this.current_shoe=shoe;
			this.setShoeText(shoe,ev);
		},
		unpeekShoe:function(shoe,ev){
			if(!shoe || shoe.name.length==0)return;
			this.current_shoe=shoe;
		    shoe.click_text={};
		},
		setShoeText:function(shoe,ev){
			if(!shoe || shoe.name.length==0)return;
		    let t={left:"\u{1F44D}",text:"Click to ?",right:"\u{1F44E}"};

        if (ev){
  		    let target=ev.target;
  		    while(!target.classList.contains("block")){
  		        target=target.parentNode;
  		    }

  		    if(ev.pageX<(target.getBoundingClientRect().left+target.clientWidth*0.5)){
  		        t.text="Click to Like";
  		        t.l=true;
  		    }else{
  		        t.text="Click to Dislike";
  		        t.r=true;
  		    }
        }
			this.current_shoe.click_text=t;

			for(let i=0;i<6;i++){
				if(this.user.queue[i]==shoe){
					this.user.queue[i].click_text=t;
				}
			}
		},
		handleClick:function(shoe,ev){
			if(!shoe || shoe.name.length==0)return;
			this.peekShoe(shoe,ev);
		    let target=ev.target;
		    while(!target.classList.contains("block")){
		        target=target.parentNode;
		    }

		    if(ev.pageX>(target.getBoundingClientRect().left+target.clientWidth*0.5)){
		        this.likeShoe(shoe);
		    }else{
		        this.dislikeShoe(shoe);
		    }
		},
		likeShoe:function(shoe){
			if(!shoe || shoe.name.length==0)return;
			//console.log("liked",shoe);
			var index=0;
			for (const s of this.user.queue){
				if (s==shoe){
					break;
				}
				index++;
			}
			if (shoe!=this.user.queue.splice(index,1)[0]){
				console.log("something with shoe likes went wrong");
			}
			this.user.wishlist.push(shoe);
			if(this.user.queue==this.user.recommendations){
				this.loadNewShoes(1);
			}else{
				const shoe=this.user.wishlist.shift();
				if(!shoe){
					this.user.queue.push(this.blank_shoe);
				}else{
					this.user.queue.push(shoe);
					let i=0;
					while(i<6 && this.user.queue[i].name.length!=0) i++;
					if(i<6){
						this.user.queue[i]=this.user.queue.pop();
						this.user.queue.push(this.blank_shoe);
					}
				}
			}
			this.unpeekShoe(shoe,{});
		},
		dislikeShoe:function(shoe){
			if(!shoe || shoe.name.length==0)return;
			//console.log("disliked",shoe);
			var index=0;
			for (const s of this.user.queue){
				if (s==shoe){
					break;
				}
				index++;
			}
			if (shoe!=this.user.queue.splice(index,1)[0]){
				console.log("something with shoe dislikes went wrong");
			}
			if(this.user.queue==this.user.recommendations){
				this.loadNewShoes(1);
			}else{
				const shoe=this.user.wishlist.shift();
				if(!shoe){
					this.user.queue.push(this.blank_shoe);
				}else{
					this.user.queue.push(shoe);
					let i=0;
					while(i<6 && this.user.queue[i].name.length!=0) i++;
					if(i<6){
						this.user.queue[i]=this.user.queue.pop();
						this.user.queue.push(this.blank_shoe);
					}
				}
			}
			this.unpeekShoe(shoe,{});
		},
		loadNewShoes(count){
			var sender=new XMLHttpRequest();
			sender.open('POST','/getshoes',false);

			sender.onreadystatechange=function(){
				if(sender.readyState==XMLHttpRequest.DONE){
					if(sender.status>=200 && sender.status<400){
						try{
							const shoes=JSON.parse(sender.responseText);

							for(let shoe of shoes){
								if(!shoe){
									Object.assign(shoe,app.blank_shoe);
									shoe.name="No more shoes to recommend!";
								}else{
									shoe.click_text=app.blank_shoe.click_text;
									shoe.real=true;
									app.user.recommendations.push(shoe);
								}
							}
						}catch(e){
							let r=window.confirm("Invalid data from server received (either due to invalid input, or an internal error). Do you want to restart the search?");
              if(r){
                window.location.reload();
              }
						}
					}
				}
			};

			sender.send(JSON.stringify({id:app.user.id,c:count}));
		},
		handleDislike:function(ev,shoe){
			if(!shoe || shoe.name.length==0)return;
			ev.preventDefault();
			this.dislikeShoe(shoe);
			return false;
		},
		showWishlist:function(){
			for(let i=0;i<6;i++){
				if(!this.user.wishlist_show[i]) this.user.wishlist_show.push(this.blank_shoe);
			}
			let i=0;
			while(i<6&&this.user.wishlist_show[i].name.length!=0) i++;
			for(;i<6;i++){
				const shoe=this.user.wishlist.shift();
				if(shoe){
					this.user.wishlist_show[i]=shoe;
				}
			}
		    this.user.queue=this.user.wishlist_show;
		    this.recommend=false;
		},
		showRecommendations:function(){
		    this.user.queue=this.user.recommendations;
		    this.recommend=true;
		},
		buyShoes:function(){
			if(!this.buyButtonClasses.pointer){
				return;
			}else{
				let r=window.confirm('You successfully bought some real shoes! Click \'Ok\' if you want to start a new search, otherwise click \'Cancel\' and continue your current search.');
				if(r){
					window.location.reload();
				}
			}
		},
		improveSearch:function(){
			if(!this.improveButtonClasses.pointer){
				return;
			}else{
				let c=window.confirm('Click \'Ok\' if you want to improve the search results based on your current wishlist.');

				if(c){
					var sender=new XMLHttpRequest();
					sender.open('POST','/improve',false);

					sender.onreadystatechange=function(){
						if(sender.readyState==XMLHttpRequest.DONE){
							if(sender.status>=200 && sender.status<400){
								try{
									let r=JSON.parse(sender.responseText);

									if(r.improved) app.loadNewShoes(6);
								}catch(e){
									let r=window.confirm("Invalid data received from server (either due to invalid input or an internal error). Do you want to restart the search?");
                  if(r){
                    window.location.reload();
                  }
								}
							}
						}
					};

					let r=[];
					for(const shoe of this.user.wishlist){
						r.push(shoe.id);
					}
					for(const shoe of this.user.wishlist_show){
						r.push(shoe.id);
					}

					const rec=[];
					for(const shoe of this.user.recommendations.splice(0,6)){
						rec.push(shoe.id);
					}

					sender.send(JSON.stringify({id:app.user.id,wl:r,recs:rec}));
				}
			}
		},
    proposeIdSearch:function(id){
      let r=window.confirm("Do you want to discard the current search, and start a new one, focusing on the selected shoe?");
      if(r){
        localStorage.setItem("id",id);
        window.location.reload();
      }
    },
    tryShoeId:function(){
      let maybe_id=localStorage.getItem("id");
      if (maybe_id){
        this.setSearchField("id:"+maybe_id);
        localStorage.clear();
        this.setQuery();
      }
    },
		newSearch:function(){
			let r=window.confirm("Do you really want to discard the current search and start a new one?");
			if(r){
				window.location.reload();
			}
		},
    },
    computed:{
		buyButtonClasses:function(){
			let c={};

			if(this.wishlistLength<=6 && this.wishlistLength>0){
				c.pointer=true;
				c.black=true;
			}else{
				c.grey=true;
			}

			return c;
		},
		improveButtonClasses:function(){
			let c={};

			if(this.wishlistLength>=2){
				c.pointer=true;
				c.black=true;
			}else{
				c.grey=true;
			}

			return c;
		},
		wishlistLength:function(){
			let num=0;
			for(const shoe of this.user.wishlist){
				if(shoe.name.length!=0) num++;
			}
			for(const shoe of this.user.wishlist_show){
				if(shoe.name.length!=0) num++;
			}
			return num;
		},
		card1classes:function(){
			return {
				'left-0': this.state<=this.stateEnums.search,
				'-left-12': this.state>this.stateEnums.search,
			};
		},
		crop1_1classes:function(){
            return{
				'flex-12':this.state<this.stateEnums.search,
				'flex-4':this.state>=this.stateEnums.search,
            };
		},
		crop1_2classes:function(){
            return{
				'flex-0':this.state<this.stateEnums.search,
				'flex-8':this.state>=this.stateEnums.search,
            };
		},

		card2classes:function(){
			return {
				'left-12': this.state<this.stateEnums.person,
				'left-0': this.state==this.stateEnums.person,
				'-left-12': this.state>this.stateEnums.person,
			};
		},

		card3classes:function(){
			return {
				'left-12': this.state<this.stateEnums.preference,
				'left-0': this.state==this.stateEnums.preference,
				'-left-12': this.state>this.stateEnums.preference,
			};
		},

		card4classes:function(){
			return {
				'left-12': this.state<this.stateEnums.shoes,
				'left-0': this.state==this.stateEnums.shoes,
				'-left-12': this.state>this.stateEnums.shoes,
			};
		},
    },
	beforeMount(){
		this.peekGender(this.genders[0]);
	},
});
