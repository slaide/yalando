const http=require("http");
const fs=require("fs");
const url=require("url");
const querystring=require("querystring");
const tss = require('typescript-simple');
const csv=require('csv-parse');
const parsecsv=require('csv-parse/lib/sync')

const hostname:string = '127.0.0.1';
const port = process.env.PORT || 3000;

const utf8={encoding:"utf8"};
const binary={encoding:"binary"};
const htmlContent={"Content-Type":"text/html"};
const cssContent={"Content-Type":"text/css"};
const pngContent={"Content-Type":"image/png"};
const jpgContent={"Content-Type":"image/jpg"};
const jsContent={"Content-Type":"application/javascript"};
//const tsContent={"Content-Type":"application/javascript"};
const jsonContent={"Content-Type":"application/json"};

const page:string=fs.readFileSync("start.html",utf8);

const responseMap={};
responseMap["/adidas-logo.jpg"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jpgContent);
	response.end(fs.readFileSync("adidas-logo.jpg"),binary);
};
responseMap["/script.js"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jsContent);
	//let scriptFileTS=fs.readFileSync("script.ts",utf8);
	//let scriptFileJS=tss(scriptFileTS);
	let scriptFile=fs.readFileSync("script.js",utf8);
	response.end(scriptFile,utf8);
};
responseMap["/typescript.compile.min.js"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jsContent);
	response.end(fs.readFileSync("typescript.compile.min.js"),utf8);
};
responseMap["/typescript.min.js"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jsContent);
	response.end(fs.readFileSync("typescript.min.js"),utf8);
};
responseMap["/generic_styles.css"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,cssContent);
	response.end(fs.readFileSync("generic_styles.css",binary));
};
responseMap["/style.css"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,cssContent);
	response.end(fs.readFileSync("style.css",binary));
};
responseMap["/"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,htmlContent);
	response.end(fs.readFileSync("start.html",binary));
};
responseMap["/male.png"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,pngContent);
	response.end(fs.readFileSync("male.png"),binary);
};
responseMap["/neutral.png"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,pngContent);
	response.end(fs.readFileSync("neutral.png"),binary);
};
responseMap["/female.png"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,pngContent);
	response.end(fs.readFileSync("female.png"),binary);
};
responseMap["/shoe.jpg"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jpgContent);
	response.end(fs.readFileSync("shoe.jpg"),binary);
};

function init_shoes(){
        
    let shoes_ret={};
    
    const shoe_path="./shoes.json";

    try{
        const file=fs.readFileSync(shoe_path,utf8);
        shoes_ret=JSON.parse(file);
    }catch{
		console.log("generating data..");

        let file=fs.readFileSync("./data/meta_data.csv",utf8);
        let meta_data=parsecsv(file,{columns:true,skip_empty_lines:true})
        
        file=fs.readFileSync("./data/image_embeddings.csv",utf8);
        let image_embeddings=parsecsv(file,{columns:true,skip_empty_lines:true,cast:true})
		
		file=fs.readFileSync("./data/review_embeddings.csv",utf8);
        let review_embeddings=parsecsv(file,{columns:true,skip_empty_lines:true,cast:true})
		
		file=fs.readFileSync("./data/interaction_embeddings.csv",utf8);
        let interaction_embeddings=parsecsv(file,{columns:true,skip_empty_lines:true})
        
        let shoes=[];
        for (const d of meta_data){
            let shoe={id:d.SARTICLENO,name:d.SARTICLENAME,price:d.PRICE,age:d.AGE,gender:d.GENDER,category:d.CATEGORY,color:d.BASE_COLOR,bullets:[],image_embeddings:[],review_embeddings:[],interaction_embeddings:[]};
            for (const b of ["SBULLET1","SBULLET2","SBULLET3","SBULLET4","SBULLET5","SBULLET6","SBULLET7"]){
                if (d[b].length>0){
                    shoe.bullets.push(d[b]);
                }
            }
            
            if(shoe.bullets.length>0) shoes.push(shoe);
        }
		
		console.log(shoes.length);
		
        for (let s_i=0; s_i<shoes.length; s_i++){
            shoes_ret[shoes[s_i].id]=shoes[s_i];
        }
		
		console.log(Object.keys(shoes_ret).length);
		        
        for (const d_i in image_embeddings){
            const d=image_embeddings[d_i];
            let shoe=shoes_ret[d.ARTICLE];
            if(shoe){
                for(const key of Object.keys(d)){
                    if(key==="ARTICLE" || key.length===0) continue;
                    shoe.image_embeddings.push(d[key]);
                }
            }
        }
		
		let shoe_keys=Object.keys(shoes_ret);
		for(const key of shoe_keys){
			if (shoes_ret[key].image_embeddings.length<1) delete shoes_ret[key];
		}
		console.log(Object.keys(shoes_ret).length);
		
        for (const d_i in review_embeddings){
            const d=review_embeddings[d_i];
            let shoe=shoes_ret[d.ARTICLENO];
            if(shoe){
                for(const key of Object.keys(d)){
                    if(key==="ARTICLENO" || key.length===0) continue;
                    shoe.review_embeddings[key]=d[key];
                }
            }
        }
		
		shoe_keys=Object.keys(shoes_ret);
		let review_keys_list=[];
		for(const key of shoe_keys){
			const review_keys=Object.keys(shoes_ret[key].review_embeddings);
			if (review_keys.length<1){
				//delete shoes_ret[key];
			}else{
				if (review_keys_list.length==0) review_keys_list=review_keys;
			}
		}
		for(const key of shoe_keys){
			const review_keys=Object.keys(shoes_ret[key].review_embeddings);
			if (review_keys.length<1){
				for (const review_key in review_keys_list){
					shoes_ret[key].review_embeddings[review_key]=0.0;
				}
			}
		}
		console.log(Object.keys(shoes_ret).length);
		
        for (const d_i in interaction_embeddings){
            const d=interaction_embeddings[d_i];
            let shoe=shoes_ret[d.article];
            if(shoe){
                for(const key of Object.keys(d)){
                    if(key==="article" || key.length===0) continue;
                    shoe.interaction_embeddings.push(d[key]);
                }
            }
        }
		
		shoe_keys=Object.keys(shoes_ret);
		for(const key of shoe_keys){
			if (shoes_ret[key].interaction_embeddings.length<1) delete shoes_ret[key];
		}
		console.log(Object.keys(shoes_ret).length);
        
        let keys=Object.keys(shoes_ret);
        for(let key of keys){
            let s=shoes_ret[key];
            
            let file;
            try{
                const filename="./data/adi_ftw_photo/"+s.id+".png";
                file=fs.readFileSync(filename,binary);
                s.image_filename=filename;
            }catch{
                try{
                    const filename="./data/adi_ftw_3d/"+s.id+".png";
                    file=fs.readFileSync(filename,binary);
                    s.image_filename=filename;
                }catch{
                    delete shoes_ret[s.id];
                }
                
            }
        }
	
		let longest_name="";
		for(const key of Object.keys(shoes_ret)){
			let shoe=shoes_ret[key];
			const new_filename="./images/"+shoe.id+".png";
			fs.copyFileSync(shoe.image_filename,new_filename);
			shoe.image_filename=new_filename;
			
			for(const n of shoe.name.split(" ")){
				if(n.length>longest_name.length) longest_name=n;
			}
		}
		
		console.log("longest sub name:",longest_name);
        
        fs.writeFileSync("./shoes.json",JSON.stringify(shoes_ret), utf8);
    }
    
    return shoes_ret;
}

const shoes:Object=init_shoes();
const shoe_ids:string[]=Object.keys(shoes);
console.log("fit shoes found: ",shoe_ids.length);

function get_user_recommendations(user){
	let shoe_keys=[];
	for (const key of shoe_ids){
		const shoe=shoes[key];
		
		switch (user.gender.name){
			case "Woman":{
				if((shoe.gender!="FEMALE" && shoe.gender!="UNISEX") || shoe.age!="A") continue;
				break;
			}
			case "Man":{
				if((shoe.gender!="MALE" && shoe.gender!="UNISEX") || shoe.age!="A") continue;
				break;
			}
			case "Adult":{
				if(shoe.age!="A") continue;
				break;
			}
			case "Girl":{
				if((shoe.gender!="FEMALE" && shoe.gender!="UNISEX") || (shoe.age!="J" && shoe.age!="I" && shoe.age!="K")) continue;
				break;
			}
			case "Boy":{
				if((shoe.gender!="MALE" && shoe.gender!="UNISEX") || (shoe.age!="J" && shoe.age!="I" && shoe.age!="K")) continue;
				break;
			}
			case "Child":{
				if(shoe.age!="J" && shoe.age!="I" && shoe.age!="K") continue;
				break;
			}
			default: {
				console.log("unknown gender?",user.gender.name);
			}
		}
		
		let discard_shoe=false;
		let ignore_category=false;
		for(const word of user.query.split(" ")){
			if(discard_shoe) break;
			if(shoe.review_embeddings[word.toLowerCase()]) ignore_category=true;
			switch(word.toLowerCase()){
				case "green":{
					if(shoe.color!="GRE") discard_shoe=true;
					break;
				}
				case "red":{
					if(shoe.color!="RED") discard_shoe=true;
					break;
				}
				case "blue":{
					if(shoe.color!="BLU") discard_shoe=true;
					break;
				}
				case "white":{
					if(shoe.color!="WHI") discard_shoe=true;
					break;
				}
				case "gray":
				case "grey":{
					if(shoe.color!="GRY") discard_shoe=true;
					break;
				}
				case "pink":{
					if(shoe.color!="PIN") discard_shoe=true;
					break;
				}
				case "metallic":{
					if(shoe.color!="MET") discard_shoe=true;
					break;
				}
				case "creme":{
					if(shoe.color!="CRE") discard_shoe=true;
					break;
				}
				case "purple":{
					if(shoe.color!="PUR") discard_shoe=true;
					break;
				}
				case "orange":{
					if(shoe.color!="ORA") discard_shoe=true;
					break;
				}
				case "black":{
					if(shoe.color!="BLA") discard_shoe=true;
					break;
				}
				case "brown":{
					if(shoe.color!="BRW") discard_shoe=true;
					break;
				}
				case "yellow":{
					if(shoe.color!="YEL") discard_shoe=true;
					break;
				}
			}
		}
		
		for(const word of user.query.split(" ")){
			if(discard_shoe) break;
			switch(word.toLowerCase()){
				case "running":{
					if (shoe.category!="RUNNING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "sport":{
					if (shoe.category!="SPORT" && !ignore_category) discard_shoe=true;
					break;
				}
				case "weightlifting":{
					if (shoe.category!="WEIGHTLIFTING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "originals":{
					if (shoe.category!="ORIGINALS" && !ignore_category) discard_shoe=true;
					break;
				}
				case "golf":{
					if (shoe.category!="GOLF" && !ignore_category) discard_shoe=true;
					break;
				}
				case "soccer":{
					if (shoe.category!="FOOTBALL/SOCCER" && !ignore_category) discard_shoe=true;
					break;
				}
				case "football":{
					if (shoe.category!="AMERICAN FOOTBALL" && !ignore_category) discard_shoe=true;
					break;
				}
				case "tennis":{
					if (shoe.category!="TENNIS" && !ignore_category) discard_shoe=true;
					break;
				}
				case "snowboarding":{
					if (shoe.category!="SNOWBOARDING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "skateboarding":{
					if (shoe.category!="SKATEBOARDING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "training":{
					if (shoe.category!="TRAINING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "trail":{
					if (shoe.category!="TRAIL RUNNING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "basketball":{
					if (shoe.category!="BASKETBALL" && !ignore_category) discard_shoe=true;
					break;
				}
				case "swim":{
					if (shoe.category!="SWIM" && !ignore_category) discard_shoe=true;
					break;
				}
				case "bike":{
					if (shoe.category!="BIKE" && !ignore_category) discard_shoe=true;
					break;
				}
				case "volleyball":{
					if (shoe.category!="VOLLEYBALL" && !ignore_category) discard_shoe=true;
					break;
				}
				case "hiking":{
					if (shoe.category!="HIKING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "handball":{
					if (shoe.category!="HANDBALL" && !ignore_category) discard_shoe=true;
					break;
				}
				case "climb":{
					if (shoe.category!="CLIMB" && !ignore_category) discard_shoe=true;
					break;
				}
				case "boxing":{
					if (shoe.category!="BOXING" && !ignore_category) discard_shoe=true;
					break;
				}
				case "field":
				case "track":{
					if (shoe.category!="TRACK AND FIELD") discard_shoe=true;
					break;
				}
			}
		}
		if(discard_shoe) continue;
		
		shoe_keys.push(key);
	}
	
	console.log("found this many shoes for a new user:",shoe_keys.length);
	
    var ret={image:[],review:[],interaction:[]};
    
    ret.review=rank_by_reviews(shoe_keys,user);
	const best_shoe=shoes[ret.review[0]];
	
	const best_image_score=best_shoe.image_embeddings;
    ret.image=rank_by_images(shoe_keys,best_image_score);
	
	const best_interaction_score=best_shoe.interaction_embeddings;
    ret.interaction=rank_by_interactions(shoe_keys,best_interaction_score);
	
	//console.log(ret.review.length,ret.image.length,ret.interaction.length);
    
    return ret;
}

function rank_by_reviews(keys,user){
	let score=function(key){
		let s=0.0;
		const shoe=shoes[key];
		for(const word of user.query.split(" ")){
			let rs=shoe.review_embeddings[word.toLowerCase()];
			if(rs) s+=parseFloat(rs);
		}
		//console.log("review",s);
		return s;
	};
	let ret=keys.slice().sort((s1,s2)=>score(s2)-score(s1));
	return ret;
}
function rank_by_images(keys,best_score){
	let score=function(key){
		const s=calc_distance(shoes[key].image_embeddings,best_score);
		//console.log("image",s,shoes[key].image_embeddings);
		return s;
	};
	let ret=keys.slice().sort((s1,s2)=>score(s2)-score(s1));
	return ret;
}
function rank_by_interactions(keys,best_score){
	let score=function(key){
		const s=calc_distance(shoes[key].interaction_embeddings,best_score);
		//console.log("interaction",s,best_score);
		return s;
	};
	let ret=keys.slice().sort((s1,s2)=>score(s2)-score(s1));
	return ret;
}
function rank_by_review_score(keys,best_score){
	let score=function(key){
		const s=calc_distance(shoes[key].review_embeddings,best_score);
		//console.log("review s",s,best_score);
		return s;
	};
	let ret=keys.slice().sort((s1,s2)=>score(s2)-score(s1));
	return ret;
}

function calc_distance(a,b){
	let ret=0.0;
	let a_length=0.0;
	let b_length=0.0;
	
	try{
		for(const key of Object.keys(a)){
			const a_value=parseFloat(a[key]);
			const b_value=parseFloat(b[key]);
			ret+=a_value*b_value;
			a_length+=a_value*a_value;
			b_length+=b_value*b_value;
		}
	}catch(e){
		console.log("objects with differing fields compared",);
		return NaN;
	}
	
	//console.log(a_length,b_length,ret);
	a_length=Math.sqrt(a_length);
	b_length=Math.sqrt(b_length);
	ret/=a_length*b_length;
	return Math.abs(ret);
}

let user_data={next_id:0};

responseMap['/senduser']=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	if(request.method=='POST'){
		let data:string='';
		request.on('data',(d)=>{
			data+=d;
		});
		request.on('end',()=>{
			try{
				let user=JSON.parse(data);
				let id=user_data.next_id;
				user_data.next_id++;
				
				user.sorted_preference=get_user_recommendations(user);
				
				user_data[id]=user;
				
				let sorted_snippet={image:[],interaction:[],review:[]};
				sorted_snippet.image=user.sorted_preference.image.slice(0,6);
				sorted_snippet.interaction=user.sorted_preference.interaction.slice(0,6);
				sorted_snippet.review=user.sorted_preference.review.slice(0,6);
				
				for(let i=0;i<6;i++){
					sorted_snippet.image[i]={id:sorted_snippet.image[i],src:sorted_snippet.image[i]+".png"};
					sorted_snippet.interaction[i]={id:sorted_snippet.interaction[i],src:sorted_snippet.interaction[i]+".png"};
					sorted_snippet.review[i]={id:sorted_snippet.review[i],src:sorted_snippet.review[i]+".png"};
				}
				
				const ret={shoes:sorted_snippet,id:id};
				
				response.writeHead(200,jsonContent);
				response.end(JSON.stringify(ret));
				
			}catch(e){
				console.log("invalid senduser input",e);
			}
		});
	}
};
responseMap['/getshoes']=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	if(request.method=='POST'){
		let data:string='';
		request.on('data',(d)=>{
			data+=d;
		});
		request.on('end',()=>{
			try{
				let d=JSON.parse(data);
				const id=d.id;
				const count=parseInt(d.c);
				if(count==NaN) throw "invalid shoe count";
				const p=d.p;
				
				let user=user_data[id];
				if(!user) throw "invalid user id";
				
				if(p && Object.keys(user.preference).length==0){
					switch(p){
						case "Image":{
							user.preference=user.sorted_preference.image;
							user.pref_name="Image";
							break;
						}
						case "Interaction":{
							user.preference=user.sorted_preference.interaction;
							user.pref_name="Interaction";
							break;
						}
						case "Review":{
							user.preference=user.sorted_preference.review;
							user.pref_name="Review";
							break;
						}
						default:{
							throw "invalid preference";
						}
					}
					delete user.sorted_preference;
				}
				
				//console.log(user.preference);
				
				let ret=[];
				for(let i=0;i<count;i++){
					let s=user.preference.shift();
					if(!!s){
						const shoe=shoes[s];
						if(!!shoe){
							ret.push({name:shoe.name,id:shoe.id,src:shoe.id+".png",bullets:shoe.bullets,price:shoe.price,price_text:shoe.price+" $"});
						}else{
							throw "invalid shoe id";
						}
					}
				}
				//console.log(ret);
				response.writeHead(200,jsonContent);
				response.end(JSON.stringify(ret));
				
			}catch(e){
				response.writeHead(404,htmlContent);
				response.end("<!doctype html><html><body>invalid input</body></html>");
				console.log("invalid getshoes input",e);
			}
		});
	}
};

responseMap['/improve']=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	if(request.method=='POST'){
		let data:string='';
		request.on('data',(d)=>{
			data+=d;
		});
		request.on('end',()=>{
			try{
				let d=JSON.parse(data);
				
				let id=d.id; 
				if(typeof id =="undefined") throw "invalid user id";
			
				let user=user_data[id];
				if(!user) throw "invalid user id";
			
				let old_shoes=d.shoes;
				if(typeof old_shoes=="undefined") throw "invalid shoes sent";
				
				switch(user.pref_name){
					case "Image":{
						let best_shoe;
						let c=0;
						for(const key of old_shoes){
							const shoe=shoes[key];
							if(!shoe) throw "invalid shoe id";
							
							if(typeof best_shoe=="undefined"){
								best_shoe=shoe.image_embeddings;
							}else{
								for(const key of Object.keys(best_shoe)){
									best_shoe[key]+=shoe.image_embeddings[key];
								}
							}
							c++;
						}
						for(const key of Object.keys(best_shoe)){
							best_shoe[key]/=c;
						}
						user.preference=rank_by_images(user.preference,best_shoe);
						break;
					}
					case "Review":{
						let best_shoe;
						let c=0;
						for(const key of old_shoes){
							const shoe=shoes[key];
							if(!shoe) throw "invalid shoe id";
							
							if(typeof best_shoe=="undefined"){
								best_shoe=shoe.review_embeddings;
							}else{
								for(const key of Object.keys(best_shoe)){
									best_shoe[key]+=shoe.review_embeddings[key];
								}
							}
							c++;
						}
						for(const key of Object.keys(best_shoe)){
							best_shoe[key]/=c;
						}
						user.preference=rank_by_review_score(user.preference,best_shoe);
						break;
					}
					case "Interaction":{
						let best_shoe;
						let c=0;
						for(const key of old_shoes){
							const shoe=shoes[key];
							if(!shoe) throw "invalid shoe id";
							
							if(typeof best_shoe=="undefined"){
								best_shoe=shoe.interaction_embeddings;
							}else{
								for(const key of Object.keys(best_shoe)){
									best_shoe[key]+=shoe.interaction_embeddings[key];
								}
							}
							c++;
						}
						for(const key of Object.keys(best_shoe)){
							best_shoe[key]/=c;
						}
						user.preference=rank_by_review_score(user.preference,best_shoe);
						break;
					}
					default: throw "invalid user preference";
				}
				
				//console.log(user);
				
				response.writeHead(200,jsonContent);
				response.end(JSON.stringify({improved:true}));
			}catch(e){
				console.log("queue improvement failed",e);
			}
		});
	}
};

const server:typeof http.Server = http.createServer(function(request:typeof http.ClientRequest, response:typeof http.ServerResponse){
	
	const userurl=url.parse(request.url);
    const query=querystring.parse(userurl.query);
    
    //console.log("path:",userurl.pathname);

	try {
		responseMap[userurl.pathname](response,request);
	}catch(e){
		if(userurl.pathname.slice(-4)==".png"){
			let id=userurl.pathname.slice(1,7);
			if(!shoes[id]){
				response.writeHead(404,htmlContent);
				response.end("<!doctype html><html><body>image not found</body></html>");
				console.log("looking for unknown shoe id:",userurl.pathname,id,shoes[id]);
			}else{
				const pathname="./images/"+id+".png";
				try{
					const image_file=fs.readFileSync(pathname);
					response.writeHead(200,pngContent);
					response.end(image_file,binary);
				}catch(e){
					console.log("no image for shoe in list found. this should not happen! remove 'shoes.json' and restart server.",pathname,e);
				}
			}
		}else{
			console.log(userurl.pathname,"not found",e);
			response.end();
		}
	}
	
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
