const http=require("http");
const fs=require("fs");
const url=require("url");
const querystring=require("querystring");

interface NumberIndexedByString{
  [key:string]:number;
}
interface NumberIndexedByNumber{
  [key:number]:number;
}
interface NumberIndexedByNumberIndexedByString{
  [key:string]:NumberIndexedByNumber;
}
interface NumberIndexedByStringIndexedByString{
  [key:string]:NumberIndexedByString;
}
type NumberIndexedBy=NumberIndexedByString|NumberIndexedByNumber|NumberIndexedByNumberIndexedByString|NumberIndexedByStringIndexedByString;

function add(a:NumberIndexedBy,b:NumberIndexedBy,undefinedIsZero?:boolean):NumberIndexedBy{
  let res;
  if(Array.isArray(a) && Array.isArray(b)){
    res=a.slice();
  }else{
    res={};
  }

  let objectKeys=Object.keys(a);

  for(const key of objectKeys){
    if(undefinedIsZero){
      res[key]=(a[key]||0)+(b[key]||0);
    }else{
      res[key]=a[key]+b[key];
    }
  }

  return res;
}
function sub(a:NumberIndexedBy,b:NumberIndexedBy,undefinedIsZero?:boolean):NumberIndexedBy{
  let res;
  if(Array.isArray(a) && Array.isArray(b)){
    res=a.slice();
  }else{
    res={};
  }

  let objectKeys=Object.keys(a);

  if(undefinedIsZero){
    for(const key of objectKeys){
      res[key]=(a[key]||0)-(b[key]||0);
    }
  }else{
    for(const key of objectKeys){
      res[key]=a[key]-b[key];
    }
  }

  return res;
}
function div(a:NumberIndexedBy,b:number):NumberIndexedBy{
  let res;
  if(Array.isArray(a)){
    res=a.slice();
  }else{
    res={};
  }

  for(const key of Object.keys(a)){
    res[key]=a[key]/b;
  }

  return res;
}
function vec_length(a:NumberIndexedBy):number{
  let res=0;
  for(const key of Object.keys(a)){
    res+=a[key]**2;
  }
  res=Math.sqrt(res);
  if(isNaN(res)) throw new Error("value is nan");
  return res;
}

function min(a,b=undefined){
  if(typeof b == "undefined" && Array.isArray(a)){
    let minimum=a[0];
    for (const e of a){
      minimum=min(e,minimum);
    }
    return minimum;
  }
  return (a<b)?a:b;
}
function max(a,b=undefined){
  if(typeof b == "undefined" && Array.isArray(a)){
    let maximum=a[0];
    for (const e of a){
      maximum=max(e,maximum);
    }
    return maximum;
  }
  return (a>b)?a:b;
}
function sum(a,b=undefined){
  if(typeof b=="undefined"){
    if(Object.keys(a).length>0){
      let s=a[0];
      let index=0;
      for(const key of Object.keys(a)){
        if(index!=0) s=sum(s,a[key]);
        index+=1;
      }
      return s;
    }else{
      return a || 0;
    }
  }else{
    if(typeof a=="undefined"){
      return sum(b);
    }else{
      const a_keys=Object.keys(a);
      const b_keys=Object.keys(b);
      if(a_keys.length>0 && b_keys.length>0){
        let s=[];
        for(const key of a_keys){
          s.push(sum(a[key],b[key]));
        }
        return s;
      }else{
        let nan_protect_a=parseFloat(a);
        let nan_protect_b=parseFloat(b);
        if(isNaN(nan_protect_a)){
          return isNaN(nan_protect_b)?0:nan_protect_b;
        }else{
          let nan_protect_sum=nan_protect_a+nan_protect_b;
          return isNaN(nan_protect_sum)?nan_protect_a:nan_protect_sum;
        }
      }
    }
  }
}
function shuffle_array(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function abs(v){
  return (v<0)?-v:v;
}

const hostname:string = '127.0.0.1';
const port = process.env.PORT || 3000;

const utf8={encoding:"utf8"};
const binary={encoding:"binary"};
const htmlContent={"Content-Type":"text/html"};
const cssContent={"Content-Type":"text/css"};
const pngContent={"Content-Type":"image/png"};
const jpgContent={"Content-Type":"image/jpg"};
const icoContent={"Content-Type":"image/x-icon"};
const jsContent={"Content-Type":"application/javascript"};
const jsonContent={"Content-Type":"application/json"};

const page:string=fs.readFileSync("start.html",utf8);

const responseMap={};
responseMap["/favicon.ico"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,icoContent);
	response.end(fs.readFileSync("favicon.ico"),binary);
};
responseMap["/adidas-logo.jpg"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jpgContent);
	response.end(fs.readFileSync("adidas-logo.jpg"),binary);
};
responseMap["/script.js"]=function(response:typeof http.ServerResponse,request:typeof http.ClientRequest){
	response.writeHead(200,jsContent);
	let scriptFile=fs.readFileSync("script.js",utf8);
	response.end(scriptFile,utf8);
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

function shoe_fits_gender(shoe,gender){
  switch (gender){
    case "Woman":{
      if((shoe.gender!="FEMALE" && shoe.gender!="UNISEX") || shoe.age!="A") return false;
      break;
    }
    case "Man":{
      if((shoe.gender!="MALE" && shoe.gender!="UNISEX") || shoe.age!="A") return false;
      break;
    }
    case "Adult":{
      if(shoe.age!="A") return false;
      break;
    }
    case "Girl":{
      if((shoe.gender!="FEMALE" && shoe.gender!="UNISEX") || (shoe.age!="J" && shoe.age!="I" && shoe.age!="K")) return false;
      break;
    }
    case "Boy":{
      if((shoe.gender!="MALE" && shoe.gender!="UNISEX") || (shoe.age!="J" && shoe.age!="I" && shoe.age!="K")) return false;
      break;
    }
    case "Child":{
      if(shoe.age!="J" && shoe.age!="I" && shoe.age!="K") return false;
      break;
    }
    default: {
      throw Error("unknown gender? "+gender);
    }
  }
  return true;
}

let whole_distance_review=73221452.55327035;
let whole_distance_interaction=472969217.0292394;
let whole_distance_image=155519612.9514396;

function init_shoes(){

    let shoes_ret={};

    const shoe_path="./shoes.json";

    try{
        const file=fs.readFileSync(shoe_path,utf8);
        shoes_ret=JSON.parse(file);
    }catch{
			console.log("generating data..");

			const csv=require('csv-parse');
			const parsecsv=require('csv-parse/lib/sync');

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
	        let shoe={id:d.SARTICLENO,name:d.SARTICLENAME,price:d.PRICE,age:d.AGE,gender:d.GENDER,category:d.CATEGORY,color:d.BASE_COLOR,bullets:[],image_embeddings:[],review_embeddings:{},interaction_embeddings:[]};
	        for (const b of ["SBULLET1","SBULLET2","SBULLET3","SBULLET4","SBULLET5","SBULLET6","SBULLET7"]){
	            if (d[b].length>0){
	                shoe.bullets.push(d[b]);
	            }
	        }

	        if(shoe.bullets.length>0) shoes.push(shoe);
	    }

      //parse shoes from array into hashmap (lookup by id)
	    for (let s_i=0; s_i<shoes.length; s_i++){
	        shoes_ret[shoes[s_i].id]=shoes[s_i];
	    }

			console.log("#shoes with metadata",Object.keys(shoes_ret).length);

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
			console.log("#shoes with image embeddings",Object.keys(shoes_ret).length);

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

      //fetch list of review words from first shoe where there are at least some review words
			shoe_keys=Object.keys(shoes_ret);
			let review_keys_list=[];
			for(const key of shoe_keys){
				const review_keys=Object.keys(shoes_ret[key].review_embeddings);
				if (review_keys.length>=1){
					if (review_keys_list.length==0){
            review_keys_list=review_keys;
            break;
          }
				}
			}
      //this code sets the review embeddings for every shoe which has none to a zero vector, which is a garbage approach but so be it
      //TODO make up something useful
			for(const key of shoe_keys){
				const review_keys=Object.keys(shoes_ret[key].review_embeddings);
				if (review_keys.length<1){
					for (const review_key of review_keys_list){
						shoes_ret[key].review_embeddings[review_key]=0.0;
					}
				}
			}
			console.log("#shoes with review embeddings",Object.keys(shoes_ret).length,"(though those without were given one)");

	    for (const d_i in interaction_embeddings){
	        const d=interaction_embeddings[d_i];
	        let shoe=shoes_ret[d.article];
	        if(shoe){
	            for(const key of Object.keys(d)){
	                if(key==="article" || key.length===0) continue;
	                shoes_ret[d.article].interaction_embeddings.push(d[key]);
	            }
	        }
	    }

      shoe_keys=Object.keys(shoes_ret);
			for(const shoe_key of shoe_keys){
        let shoe=shoes_ret[shoe_key];
				if (shoe.interaction_embeddings.length<1) delete shoes_ret[shoe_key];
			}
			console.log("#shoes with interaction embeddings",Object.keys(shoes_ret).length);

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

			console.log("#shoes with image",Object.keys(shoes_ret).length);

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

			console.log("longest sub name of a shoe:",longest_name,"(necessary info for some interface scaling issues)");

      console.log("saving generated data..");
      fs.writeFileSync("./shoes.json",JSON.stringify(shoes_ret), utf8);
      console.log("saved");
    }

    if(false){
      const shoe_keys=Object.keys(shoes_ret);

      let outer=0;
      for(const key1 of shoe_keys){
        for(const key2 of shoe_keys){
          if(key1==key2) break;

          whole_distance_review+=vec_length(
            sub(
              shoes_ret[key1].review_embeddings,
              shoes_ret[key2].review_embeddings
            )
          );
          whole_distance_interaction+=vec_length(
            sub(
              shoes_ret[key1].interaction_embeddings,
              shoes_ret[key2].interaction_embeddings
            )
          );
          whole_distance_image+=vec_length(
            sub(
              shoes_ret[key1].image_embeddings,
              shoes_ret[key2].image_embeddings
            )
          );
        }
        outer+=1;
        console.log(outer);
      }
    }

    return shoes_ret;
}

const shoes:Object=init_shoes();
const shoe_ids:string[]=Object.keys(shoes);
console.log("fit shoes found: ",shoe_ids.length);

function get_user_recommendations(user){
  let search_id=false;
  let id=undefined;
  for (const word of user.query.split(" ")){
    if (word.slice(0,3)=="id:"){
      search_id=true;
      id=word.slice(3);
    }
  }

	let shoe_keys=[];
  if(search_id){
    let id_shoe=shoes[id];
    if (!id_shoe) throw Error("id ("+id+") does not exist, but was explicitely searched for");
    shoe_keys=shoe_ids.slice().filter(key=>{
      const shoe=shoes[key];
      let gender="";
      switch(id_shoe.age){
        case "I":
        case "J":
        case "K":{
          switch (id_shoe.gender){
            case "UNISEX":{
              gender="Child";
              break;
            }
            case "FEMALE":{
              gender="Girl";
              break;
            }
            case "MALE":{
              gender="Boy";
              break;
            }
          }
          break;
        }
        case "A":{
          switch (id_shoe.gender){
            case "UNISEX":{
              gender="Adult";
              break;
            }
            case "FEMALE":{
              gender="Woman";
              break;
            }
            case "MALE":{
              gender="Man";
              break;
            }
          }
          break;
        }
      }
      return shoe_fits_gender(shoe,gender);
    });
  }else{
  	for (const key of shoe_ids){
  		const shoe=shoes[key];

      if (!shoe_fits_gender(shoe,user.gender.name)){
        continue;
      }

  		let word_found=false;
  		let discard_shoe=false;
  		let ignore_category=false;
  		let user_query_words=user.query.toLowerCase().split(" ");
  		for(const word of user_query_words){
  			if(discard_shoe) break;
  			if(shoe.review_embeddings[word]) ignore_category=true;
  			switch(word){
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

  		for(const word of user_query_words){
  			if(discard_shoe) break;
  			switch(word){
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

  		//discard football shoes if user does not explicitely search for football shoes
  		if(user_query_words.indexOf("soccer")==-1 && shoe.category=="FOOTBALL/SOCCER") discard_shoe=true;

  		if(discard_shoe) continue;

  		shoe_keys.push(key);
  	}
  }

	//console.log("found this many shoes for a new user:",shoe_keys.length);

  var ret={image:[],review:[],interaction:[],randomized:{review:false,image:false,interaction:false}};

	let review_ranked=rank_by_reviews(shoe_keys,user);

	//if no review words are found, randomize search results and signal to the client that all queues are random (though only one is sent because sending multiple completely random queues is confusing)
	if(review_ranked.ms<0.0000001 && !search_id){
		const shuffled_shoes=shuffle_array(review_ranked.r.slice());

		ret.review=shuffled_shoes;
		ret.image=[];
		ret.interaction=[];
    ret.randomized.review=true;
    ret.randomized.image=true;
    ret.randomized.interaction=true;

    user.all_queues_random=true;
  }else if(search_id){
		const best_shoe=shoes[id];
    ret.review=rank_by_review_score(shoe_keys,best_shoe.review_embeddings);
    //if first shoe is not the searched one, its review embeddings are all 0 (which is also the case for many others), so randomize results, but still put the specified one in the front
    if(ret.review[0]!=id){
      shuffle_array(ret.review);
      let index=ret.review.findIndex(k=>k==id);
      if(!index) throw "id not found that should definitely be there!";
      let temp=ret.review[0];
      ret.review[0]=ret.review[index];
      ret.review[index]=temp;
      ret.randomized.review=true;
    }
		ret.image=rank_by_images(shoe_keys,best_shoe.image_embeddings);
		ret.interaction=rank_by_interactions(shoe_keys,best_shoe.interaction_embeddings);
	}else{
		ret.review=review_ranked.r;

		const best_shoe=shoes[ret.review[0]];

		const best_image_score=best_shoe.image_embeddings;
		ret.image=rank_by_images(shoe_keys,best_image_score);

		const best_interaction_score=best_shoe.interaction_embeddings;
		ret.interaction=rank_by_interactions(shoe_keys,best_interaction_score);
	}

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
		return s;
	};
	let max_score=0.0;
	let scores={};
	for (const key of keys){
		const s=score(key);
		scores[key]=s;
		if(s>max_score) max_score=s;
	}
	let ret=keys.slice().sort((s1,s2)=>scores[s2]-scores[s1]);

	return {r:ret,ms:max_score};
}
function rank_by_images(keys,best_score){
	let scores={};
	for (const key of keys){
		scores[key]=cos_similarity(shoes[key].image_embeddings,best_score);
	}
	let ret=keys.slice().sort((s1,s2)=>scores[s2]-scores[s1]);

  let max_score=0.0;
  for (const key of keys){
    max_score=Math.max(scores[key],max_score);
  }
  console.log(max_score);

	return ret;
}
function rank_by_interactions(keys,best_score){
	let scores={};
	for (const key of keys){
		scores[key]=cos_similarity(shoes[key].interaction_embeddings,best_score);
	}
	let ret=keys.slice().sort((s1,s2)=>scores[s2]-scores[s1]);

	return ret;
}
function rank_by_review_score(keys,best_score){
	let scores={};
	for (const key of keys){
		scores[key]=cos_similarity(shoes[key].review_embeddings,best_score);
	}
	let ret=keys.slice().sort((s1,s2)=>scores[s2]-scores[s1]);

	return ret;
}

function cos_similarity(a,b){
	let ret=0.0;
	let a_length=0.0;
	let b_length=0.0;

	for(const key of Object.keys(a)){
		const a_value=parseFloat(a[key]);
		const b_value=parseFloat(b[key]);
		ret+=a_value*b_value;
		a_length+=a_value*a_value;
		b_length+=b_value*b_value;
	}

	a_length=Math.sqrt(a_length);
	b_length=Math.sqrt(b_length);

	ret/=a_length*b_length;
  if (isNaN(ret)){
    ret=0.0;
  }
  ret=Math.abs(ret);
	return ret;
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
        user.all_queues_random=false;
				let id=user_data.next_id;
				user_data.next_id++;

				//console.log(user);
				user.sorted_preference=get_user_recommendations(user);

				user_data[id]=user;

				let sorted_snippet={image:[],interaction:[],review:[],randomized:user.sorted_preference.randomized};
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
				console.log("invalid senduser input: ",e.message);
        response.end();
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
              let word_keys=Object.keys(shoe.review_embeddings);
              word_keys.sort((w1,w2)=>{
                return shoe.review_embeddings[w2]-shoe.review_embeddings[w1];
              });
              const words=word_keys.slice(0,5);
							ret.push({name:shoe.name,id:shoe.id,src:shoe.id+".png",bullets:shoe.bullets,price:shoe.price,price_text:shoe.price+" $",words});
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
				console.log("invalid getshoes input: ",e.message?e.message:e);
        throw e;
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

				let wishlisted=d.wl;
				if(!wishlisted) throw "invalid wishlist contents";

				let recs=d.recs;
				if(!recs) throw "invalid recommendation contents";

				for(const key of recs){
					if(!!key) user.recommendations.push(key);
				}

        if(!!user.all_queues_random){
          let image_scores=[];
          let temp_embeddings=[];

          //create list with embedding of each wishlisted shoe
          for(const shoe_key of wishlisted){
            if(typeof shoe_key=="undefined" || shoe_key.length==0) continue;
            if(typeof shoes[shoe_key]=="undefined") throw new Error(`shoe for id not found. what? ${shoe_key}`);
            temp_embeddings.push(shoes[shoe_key].image_embeddings);
          }
          //get emebdding of first shoe to build average embedding
          let average_embedding=temp_embeddings[0];
          //for each wishlisted shoe (after the first)
          for(const embedding of temp_embeddings.slice(1)){
            //for each key of the embedding
            for(const key of Object.keys(embedding)){
              //add indexed value to to-be-averaged-embedding
              average_embedding[key]+=embedding[key];
            }
          }
          for(const key of Object.keys(average_embedding)){
            average_embedding[key]/=temp_embeddings.length;
          }
          for(const embedding of temp_embeddings){
            image_scores.push(embedding,average_embedding);
          }

          let review_scores=[];
          temp_embeddings=[];

          //create list with embedding of each wishlisted shoe
          for(const shoe_key of wishlisted){
            if(typeof shoe_key=="undefined" || shoe_key.length==0) continue;
            if(typeof shoes[shoe_key]=="undefined") throw new Error(`shoe for id not found. what? ${shoe_key}`);
            temp_embeddings.push(shoes[shoe_key].review_embeddings);
          }
          //get emebdding of first shoe to build average embedding
          average_embedding=temp_embeddings[0];
          //for each wishlisted shoe (after the first)
          for(const embedding of temp_embeddings.slice(1)){
            //for each key of the embedding
            for(const key of Object.keys(embedding)){
              //add indexed value to to-be-averaged-embedding
              average_embedding[key]+=embedding[key];
            }
          }
          for(const key of Object.keys(average_embedding)){
            average_embedding[key]/=temp_embeddings.length;
          }
          for(const embedding of temp_embeddings){
            review_scores.push(embedding,average_embedding);
          }

          let interaction_scores=[];
          temp_embeddings=[];

          //create list with embedding of each wishlisted shoe
          for(const shoe_key of wishlisted){
            if(typeof shoe_key=="undefined" || shoe_key.length==0) continue;
            if(typeof shoes[shoe_key]=="undefined") throw new Error(`shoe for id not found. what? ${shoe_key}`);
            temp_embeddings.push(shoes[shoe_key].interaction_embeddings);
          }
          //get emebdding of first shoe to build average embedding
          average_embedding=temp_embeddings[0];
          //for each wishlisted shoe (after the first)
          for(const embedding of temp_embeddings.slice(1)){
            //for each key of the embedding
            for(const key of Object.keys(embedding)){
              //add indexed value to to-be-averaged-embedding
              average_embedding[key]+=embedding[key];
            }
          }
          for(const key of Object.keys(average_embedding)){
            average_embedding[key]/=temp_embeddings.length;
          }
          for(const embedding of temp_embeddings){
            interaction_scores.push(embedding,average_embedding);
          }

          const abs_image=abs(sum(sum(image_scores)));
          const abs_review=abs(sum(sum(review_scores)));
          const abs_interaction=abs(sum(sum(interaction_scores)));

          const abs_vector=[abs_image,abs_review,abs_interaction];
          switch(abs_vector.indexOf(min(abs_vector))){
            case 0:{
              user.pre_name="Image";
              console.log("switched random queue to image queue",abs_vector);
              break;
            }
            case 1:{
              user.pre_name="Review";
              console.log("switched random queue to review queue",abs_vector);
              break;
            }
            case 2:{
              user.pre_name="Interaction";
              console.log("switched random queue to interaction queue",abs_vector);
              break;
            }
            default: throw new Error("unknown minimum preference");
          }
          user.all_queues_random=false;
        }

				switch(user.pref_name){
					case "Image":{
						let best_shoe;
						let c=0;
						//calc median vector of embeddings of wishlisted shoes as best shoe embeddings
						for(const key of wishlisted){
							const shoe=shoes[key];
							if(!shoe) continue;//throw "image, invalid shoe id "+key;

              //console.log(key);

							if(typeof best_shoe=="undefined"){
                best_shoe={};
                for (const image_key of Object.keys(shoe.image_embeddings)){
  								best_shoe[image_key]=parseFloat(shoe.image_embeddings[image_key]);
                }
							}else{
								for(const key of Object.keys(best_shoe)){
									best_shoe[key]+=parseFloat(shoe.image_embeddings[key]);
								}
							}
							c++;
						}
            //console.log(c);
						for(const key of Object.keys(best_shoe)){
							best_shoe[key]/=c;
						}
            //console.log(best_shoe);
						for(const key of recs){
              user.preference.push(key);
						}
						user.preference=rank_by_images(user.preference,best_shoe);
						break;
					}
					case "Review":{
						let best_shoe;
						let c=0;
						for(const key of wishlisted){
							const shoe=shoes[key];
							if(!shoe) continue;//throw "review, invalid shoe id "+key;

							if(typeof best_shoe=="undefined"){
                best_shoe={};
                for (const image_key of Object.keys(shoe.review_embeddings)){
  								best_shoe[image_key]=parseFloat(shoe.review_embeddings[image_key]);
                }
							}else{
								for(const key of Object.keys(best_shoe)){
									best_shoe[key]+=parseFloat(shoe.review_embeddings[key]);
								}
							}
							c++;
						}
						for(const key of Object.keys(best_shoe)){
							best_shoe[key]/=c;
						}
						for(const key of recs){
              user.preference.push(key);
						}
						user.preference=rank_by_review_score(user.preference,best_shoe);
						break;
					}
					case "Interaction":{
						let best_shoe;
						let c=0;
						for(const key of wishlisted){
							const shoe=shoes[key];
							if(!shoe) continue;//throw "interaction, invalid shoe id "+key;

							if(typeof best_shoe=="undefined"){
                best_shoe={};
                for (const image_key of Object.keys(shoe.interaction_embeddings)){
  								best_shoe[image_key]=parseFloat(shoe.interaction_embeddings[image_key]);
                }
							}else{
								for(const key of Object.keys(best_shoe)){
									best_shoe[key]+=parseFloat(shoe.interaction_embeddings[key]);
								}
							}
							c++;
						}
						for(const key of recs){
              user.preference.push(key);
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
				console.log("queue improvement failed because:",e,e.message);
        response.end();
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
					console.log("no image for shoe in list found. this should not happen! remove 'shoes.json' and restart server. (image path:",pathname," and error message:",e.message,")");
				}
			}
		}else{
      console.log("warning:",userurl.pathname+" not found");
			response.end();
		}
	}

});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
