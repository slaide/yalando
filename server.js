var http = require("http");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
function shuffleArray(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
}
var hostname = '127.0.0.1';
var port = 3000;
var utf8 = { encoding: "utf8" };
var binary = { encoding: "binary" };
var htmlContent = { "Content-Type": "text/html" };
var cssContent = { "Content-Type": "text/css" };
var pngContent = { "Content-Type": "image/png" };
var jpgContent = { "Content-Type": "image/jpg" };
var jsContent = { "Content-Type": "application/javascript" };
//const tsContent={"Content-Type":"application/javascript"};
var jsonContent = { "Content-Type": "application/json" };
var page = fs.readFileSync("start.html", utf8);
var responseMap = {};
responseMap["/adidas-logo.jpg"] = function (response, request) {
    response.writeHead(200, jpgContent);
    response.end(fs.readFileSync("adidas-logo.jpg"), binary);
};
responseMap["/script.js"] = function (response, request) {
    response.writeHead(200, jsContent);
    //let scriptFileTS=fs.readFileSync("script.ts",utf8);
    //let scriptFileJS=tss(scriptFileTS);
    var scriptFile = fs.readFileSync("script.js", utf8);
    response.end(scriptFile, utf8);
};
responseMap["/typescript.compile.min.js"] = function (response, request) {
    response.writeHead(200, jsContent);
    response.end(fs.readFileSync("typescript.compile.min.js"), utf8);
};
responseMap["/typescript.min.js"] = function (response, request) {
    response.writeHead(200, jsContent);
    response.end(fs.readFileSync("typescript.min.js"), utf8);
};
responseMap["/generic_styles.css"] = function (response, request) {
    response.writeHead(200, cssContent);
    response.end(fs.readFileSync("generic_styles.css", binary));
};
responseMap["/style.css"] = function (response, request) {
    response.writeHead(200, cssContent);
    response.end(fs.readFileSync("style.css", binary));
};
responseMap["/"] = function (response, request) {
    response.writeHead(200, htmlContent);
    response.end(fs.readFileSync("start.html", binary));
};
responseMap["/male.png"] = function (response, request) {
    response.writeHead(200, pngContent);
    response.end(fs.readFileSync("male.png"), binary);
};
responseMap["/neutral.png"] = function (response, request) {
    response.writeHead(200, pngContent);
    response.end(fs.readFileSync("neutral.png"), binary);
};
responseMap["/female.png"] = function (response, request) {
    response.writeHead(200, pngContent);
    response.end(fs.readFileSync("female.png"), binary);
};
responseMap["/shoe.jpg"] = function (response, request) {
    response.writeHead(200, jpgContent);
    response.end(fs.readFileSync("shoe.jpg"), binary);
};
function init_shoes() {
    var shoes_ret = {};
    var shoe_path = "./shoes.json";
    try {
        var file = fs.readFileSync(shoe_path, utf8);
        shoes_ret = JSON.parse(file);
    }
    catch (_a) {
        var csv = require('csv-parse');
        var parsecsv = require('csv-parse/lib/sync');
        console.log("generating data..");
        var file = fs.readFileSync("./data/meta_data.csv", utf8);
        var meta_data = parsecsv(file, { columns: true, skip_empty_lines: true });
        file = fs.readFileSync("./data/image_embeddings.csv", utf8);
        var image_embeddings = parsecsv(file, { columns: true, skip_empty_lines: true, cast: true });
        file = fs.readFileSync("./data/review_embeddings.csv", utf8);
        var review_embeddings = parsecsv(file, { columns: true, skip_empty_lines: true, cast: true });
        file = fs.readFileSync("./data/interaction_embeddings.csv", utf8);
        var interaction_embeddings = parsecsv(file, { columns: true, skip_empty_lines: true });
        var shoes_1 = [];
        for (var _i = 0, meta_data_1 = meta_data; _i < meta_data_1.length; _i++) {
            var d = meta_data_1[_i];
            var shoe = { id: d.SARTICLENO, name: d.SARTICLENAME, price: d.PRICE, age: d.AGE, gender: d.GENDER, category: d.CATEGORY, color: d.BASE_COLOR, bullets: [], image_embeddings: [], review_embeddings: {}, interaction_embeddings: [] };
            for (var _b = 0, _c = ["SBULLET1", "SBULLET2", "SBULLET3", "SBULLET4", "SBULLET5", "SBULLET6", "SBULLET7"]; _b < _c.length; _b++) {
                var b = _c[_b];
                if (d[b].length > 0) {
                    shoe.bullets.push(d[b]);
                }
            }
            if (shoe.bullets.length > 0)
                shoes_1.push(shoe);
        }
        console.log(shoes_1.length);
        for (var s_i = 0; s_i < shoes_1.length; s_i++) {
            shoes_ret[shoes_1[s_i].id] = shoes_1[s_i];
        }
        console.log(Object.keys(shoes_ret).length);
        for (var d_i in image_embeddings) {
            var d = image_embeddings[d_i];
            var shoe = shoes_ret[d.ARTICLE];
            if (shoe) {
                for (var _d = 0, _e = Object.keys(d); _d < _e.length; _d++) {
                    var key = _e[_d];
                    if (key === "ARTICLE" || key.length === 0)
                        continue;
                    shoe.image_embeddings.push(d[key]);
                }
            }
        }
        var shoe_keys = Object.keys(shoes_ret);
        for (var _f = 0, shoe_keys_1 = shoe_keys; _f < shoe_keys_1.length; _f++) {
            var key = shoe_keys_1[_f];
            if (shoes_ret[key].image_embeddings.length < 1)
                delete shoes_ret[key];
        }
        console.log(Object.keys(shoes_ret).length);
        for (var d_i in review_embeddings) {
            var d = review_embeddings[d_i];
            var shoe = shoes_ret[d.ARTICLENO];
            if (shoe) {
                for (var _g = 0, _h = Object.keys(d); _g < _h.length; _g++) {
                    var key = _h[_g];
                    if (key === "ARTICLENO" || key.length === 0)
                        continue;
                    shoe.review_embeddings[key] = d[key];
                }
            }
        }
        shoe_keys = Object.keys(shoes_ret);
        var review_keys_list = [];
        for (var _j = 0, shoe_keys_2 = shoe_keys; _j < shoe_keys_2.length; _j++) {
            var key = shoe_keys_2[_j];
            var review_keys = Object.keys(shoes_ret[key].review_embeddings);
            if (review_keys.length >= 1) {
                if (review_keys_list.length == 0)
                    review_keys_list = review_keys;
            }
        }
        for (var _k = 0, shoe_keys_3 = shoe_keys; _k < shoe_keys_3.length; _k++) {
            var key = shoe_keys_3[_k];
            var review_keys = Object.keys(shoes_ret[key].review_embeddings);
            if (review_keys.length < 1) {
                for (var _l = 0, review_keys_list_1 = review_keys_list; _l < review_keys_list_1.length; _l++) {
                    var review_key = review_keys_list_1[_l];
                    shoes_ret[key].review_embeddings[review_key] = 0.0;
                }
            }
        }
        console.log(Object.keys(shoes_ret).length);
        for (var d_i in interaction_embeddings) {
            var d = interaction_embeddings[d_i];
            var shoe = shoes_ret[d.article];
            if (shoe) {
                for (var _m = 0, _o = Object.keys(d); _m < _o.length; _m++) {
                    var key = _o[_m];
                    if (key === "article" || key.length === 0)
                        continue;
                    shoe.interaction_embeddings.push(d[key]);
                }
            }
        }
        shoe_keys = Object.keys(shoes_ret);
        for (var _p = 0, shoe_keys_4 = shoe_keys; _p < shoe_keys_4.length; _p++) {
            var key = shoe_keys_4[_p];
            if (shoes_ret[key].interaction_embeddings.length < 1)
                delete shoes_ret[key];
        }
        console.log(Object.keys(shoes_ret).length);
        var keys = Object.keys(shoes_ret);
        for (var _q = 0, keys_1 = keys; _q < keys_1.length; _q++) {
            var key = keys_1[_q];
            var s = shoes_ret[key];
            var file_1 = void 0;
            try {
                var filename = "./data/adi_ftw_photo/" + s.id + ".png";
                file_1 = fs.readFileSync(filename, binary);
                s.image_filename = filename;
            }
            catch (_r) {
                try {
                    var filename = "./data/adi_ftw_3d/" + s.id + ".png";
                    file_1 = fs.readFileSync(filename, binary);
                    s.image_filename = filename;
                }
                catch (_s) {
                    delete shoes_ret[s.id];
                }
            }
        }
        var longest_name = "";
        for (var _t = 0, _u = Object.keys(shoes_ret); _t < _u.length; _t++) {
            var key = _u[_t];
            var shoe = shoes_ret[key];
            var new_filename = "./images/" + shoe.id + ".png";
            fs.copyFileSync(shoe.image_filename, new_filename);
            shoe.image_filename = new_filename;
            for (var _v = 0, _w = shoe.name.split(" "); _v < _w.length; _v++) {
                var n = _w[_v];
                if (n.length > longest_name.length)
                    longest_name = n;
            }
        }
        console.log("longest sub name:", longest_name);
        fs.writeFileSync("./shoes.json", JSON.stringify(shoes_ret), utf8);
    }
    return shoes_ret;
}
var shoes = init_shoes();
var shoe_ids = Object.keys(shoes);
console.log("fit shoes found: ", shoe_ids.length);
function get_user_recommendations(user) {
    var shoe_keys = [];
    for (var _i = 0, shoe_ids_1 = shoe_ids; _i < shoe_ids_1.length; _i++) {
        var key = shoe_ids_1[_i];
        var shoe = shoes[key];
        switch (user.gender.name) {
            case "Woman": {
                if ((shoe.gender != "FEMALE" && shoe.gender != "UNISEX") || shoe.age != "A")
                    continue;
                break;
            }
            case "Man": {
                if ((shoe.gender != "MALE" && shoe.gender != "UNISEX") || shoe.age != "A")
                    continue;
                break;
            }
            case "Adult": {
                if (shoe.age != "A")
                    continue;
                break;
            }
            case "Girl": {
                if ((shoe.gender != "FEMALE" && shoe.gender != "UNISEX") || (shoe.age != "J" && shoe.age != "I" && shoe.age != "K"))
                    continue;
                break;
            }
            case "Boy": {
                if ((shoe.gender != "MALE" && shoe.gender != "UNISEX") || (shoe.age != "J" && shoe.age != "I" && shoe.age != "K"))
                    continue;
                break;
            }
            case "Child": {
                if (shoe.age != "J" && shoe.age != "I" && shoe.age != "K")
                    continue;
                break;
            }
            default: {
                console.log("unknown gender?", user.gender.name);
            }
        }
        var discard_shoe = false;
        var ignore_category = false;
        for (var _a = 0, _b = user.query.split(" "); _a < _b.length; _a++) {
            var word = _b[_a];
            if (discard_shoe)
                break;
            if (shoe.review_embeddings[word.toLowerCase()])
                ignore_category = true;
            switch (word.toLowerCase()) {
                case "green": {
                    if (shoe.color != "GRE")
                        discard_shoe = true;
                    break;
                }
                case "red": {
                    if (shoe.color != "RED")
                        discard_shoe = true;
                    break;
                }
                case "blue": {
                    if (shoe.color != "BLU")
                        discard_shoe = true;
                    break;
                }
                case "white": {
                    if (shoe.color != "WHI")
                        discard_shoe = true;
                    break;
                }
                case "gray":
                case "grey": {
                    if (shoe.color != "GRY")
                        discard_shoe = true;
                    break;
                }
                case "pink": {
                    if (shoe.color != "PIN")
                        discard_shoe = true;
                    break;
                }
                case "metallic": {
                    if (shoe.color != "MET")
                        discard_shoe = true;
                    break;
                }
                case "creme": {
                    if (shoe.color != "CRE")
                        discard_shoe = true;
                    break;
                }
                case "purple": {
                    if (shoe.color != "PUR")
                        discard_shoe = true;
                    break;
                }
                case "orange": {
                    if (shoe.color != "ORA")
                        discard_shoe = true;
                    break;
                }
                case "black": {
                    if (shoe.color != "BLA")
                        discard_shoe = true;
                    break;
                }
                case "brown": {
                    if (shoe.color != "BRW")
                        discard_shoe = true;
                    break;
                }
                case "yellow": {
                    if (shoe.color != "YEL")
                        discard_shoe = true;
                    break;
                }
            }
        }
        for (var _c = 0, _d = user.query.split(" "); _c < _d.length; _c++) {
            var word = _d[_c];
            if (discard_shoe)
                break;
            switch (word.toLowerCase()) {
                case "running": {
                    if (shoe.category != "RUNNING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "sport": {
                    if (shoe.category != "SPORT" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "weightlifting": {
                    if (shoe.category != "WEIGHTLIFTING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "originals": {
                    if (shoe.category != "ORIGINALS" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "golf": {
                    if (shoe.category != "GOLF" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "soccer": {
                    if (shoe.category != "FOOTBALL/SOCCER" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "football": {
                    if (shoe.category != "AMERICAN FOOTBALL" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "tennis": {
                    if (shoe.category != "TENNIS" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "snowboarding": {
                    if (shoe.category != "SNOWBOARDING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "skateboarding": {
                    if (shoe.category != "SKATEBOARDING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "training": {
                    if (shoe.category != "TRAINING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "trail": {
                    if (shoe.category != "TRAIL RUNNING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "basketball": {
                    if (shoe.category != "BASKETBALL" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "swim": {
                    if (shoe.category != "SWIM" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "bike": {
                    if (shoe.category != "BIKE" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "volleyball": {
                    if (shoe.category != "VOLLEYBALL" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "hiking": {
                    if (shoe.category != "HIKING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "handball": {
                    if (shoe.category != "HANDBALL" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "climb": {
                    if (shoe.category != "CLIMB" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "boxing": {
                    if (shoe.category != "BOXING" && !ignore_category)
                        discard_shoe = true;
                    break;
                }
                case "field":
                case "track": {
                    if (shoe.category != "TRACK AND FIELD")
                        discard_shoe = true;
                    break;
                }
                case "olympic":
                case "olympics": {
                    if (shoe.category != "OLYMPIC SPORTS")
                        discard_shoe = true;
                    break;
                }
            }
        }
        if (discard_shoe)
            continue;
        shoe_keys.push(key);
    }
    console.log("found this many shoes for a new user:", shoe_keys.length);
    var ret = { image: [], review: [], interaction: [] };
    var rbr = rank_by_reviews(shoe_keys, user);
    if (rbr.ms != 0.0) {
        ret.review = rbr.keys;
        var i = Math.random() * 5;
        var best_shoe = shoes[ret.review[i | 0]]; //i | 0 is fast cast to integer
        var best_image_score = best_shoe.image_embeddings;
        ret.image = rank_by_images(shoe_keys, best_image_score);
        i = Math.random() * 5;
        best_shoe = shoes[ret.review[i | 0]]; //i | 0 is fast cast to integer
        var best_interaction_score = best_shoe.interaction_embeddings;
        ret.interaction = rank_by_interactions(shoe_keys, best_interaction_score);
        //console.log(ret.review.length,ret.image.length,ret.interaction.length);
    }
    else {
        ret.review = shoe_keys.slice();
        shuffleArray(ret.review);
        ret.image = shoe_keys.slice();
        shuffleArray(ret.image);
        ret.interaction = shoe_keys.slice();
        shuffleArray(ret.interaction);
    }
    return ret;
}
function rank_by_reviews(keys, user) {
    var score = function (key) {
        var s = 0.0;
        var shoe = shoes[key];
        for (var _i = 0, _a = user.query.split(" "); _i < _a.length; _i++) {
            var word = _a[_i];
            var rs = shoe.review_embeddings[word.toLowerCase()];
            if (!!rs)
                s += parseFloat(rs);
        }
        return s;
    };
    var max_score = 0.0;
    var scores = {};
    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
        var key = keys_2[_i];
        var new_score = score(key);
        scores[key] = score(key);
        if (new_score > max_score)
            max_score = new_score;
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return { keys: ret, ms: max_score };
}
function rank_by_images(keys, best_score) {
    var score = function (key) {
        var s = calc_distance(shoes[key].image_embeddings, best_score);
        //console.log("image",s,shoes[key].image_embeddings);
        return s;
    };
    var scores = {};
    for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
        var key = keys_3[_i];
        scores[key] = score(key);
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return ret;
}
function rank_by_interactions(keys, best_score) {
    var score = function (key) {
        var s = calc_distance(shoes[key].interaction_embeddings, best_score);
        //console.log("interaction",s,best_score);
        return s;
    };
    var scores = {};
    for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
        var key = keys_4[_i];
        scores[key] = score(key);
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return ret;
}
function rank_by_review_score(keys, best_score) {
    var score = function (key) {
        var s = calc_distance(shoes[key].review_embeddings, best_score);
        //console.log("review s",s,best_score);
        return s;
    };
    var scores = {};
    for (var _i = 0, keys_5 = keys; _i < keys_5.length; _i++) {
        var key = keys_5[_i];
        scores[key] = score(key);
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return ret;
}
function calc_distance(a, b) {
    var ret = 0.0;
    var a_length = 0.0;
    var b_length = 0.0;
    try {
        for (var _i = 0, _a = Object.keys(a); _i < _a.length; _i++) {
            var key = _a[_i];
            var a_value = parseFloat(a[key]);
            var b_value = parseFloat(b[key]);
            ret += a_value * b_value;
            a_length += a_value * a_value;
            b_length += b_value * b_value;
        }
    }
    catch (e) {
        console.log("objects with differing fields compared");
        return NaN;
    }
    //console.log(a_length,b_length,ret);
    a_length = Math.sqrt(a_length);
    b_length = Math.sqrt(b_length);
    ret /= a_length * b_length;
    return Math.abs(ret);
}
var user_data = { next_id: 0 };
responseMap['/senduser'] = function (response, request) {
    if (request.method == 'POST') {
        var data_1 = '';
        request.on('data', function (d) {
            data_1 += d;
        });
        request.on('end', function () {
            try {
                var user = JSON.parse(data_1);
                var id = user_data.next_id;
                user_data.next_id++;
                user.sorted_preference = get_user_recommendations(user);
                user_data[id] = user;
                var sorted_snippet = { image: [], interaction: [], review: [] };
                sorted_snippet.image = user.sorted_preference.image.slice(0, 6);
                sorted_snippet.interaction = user.sorted_preference.interaction.slice(0, 6);
                sorted_snippet.review = user.sorted_preference.review.slice(0, 6);
                for (var i = 0; i < 6; i++) {
                    sorted_snippet.image[i] = { id: sorted_snippet.image[i], src: sorted_snippet.image[i] + ".png" };
                    sorted_snippet.interaction[i] = { id: sorted_snippet.interaction[i], src: sorted_snippet.interaction[i] + ".png" };
                    sorted_snippet.review[i] = { id: sorted_snippet.review[i], src: sorted_snippet.review[i] + ".png" };
                }
                var ret = { shoes: sorted_snippet, id: id };
                response.writeHead(200, jsonContent);
                response.end(JSON.stringify(ret));
            }
            catch (e) {
                console.log("invalid senduser input", e);
            }
        });
    }
};
responseMap['/getshoes'] = function (response, request) {
    if (request.method == 'POST') {
        var data_2 = '';
        request.on('data', function (d) {
            data_2 += d;
        });
        request.on('end', function () {
            try {
                var d = JSON.parse(data_2);
                var id = d.id;
                var count = parseInt(d.c);
                if (count == NaN)
                    throw "invalid shoe count";
                var p = d.p;
                var user = user_data[id];
                if (!user)
                    throw "invalid user id";
                if (p && Object.keys(user.preference).length == 0) {
                    switch (p) {
                        case "Image": {
                            user.preference = user.sorted_preference.image;
                            user.pref_name = "Image";
                            break;
                        }
                        case "Interaction": {
                            user.preference = user.sorted_preference.interaction;
                            user.pref_name = "Interaction";
                            break;
                        }
                        case "Review": {
                            user.preference = user.sorted_preference.review;
                            user.pref_name = "Review";
                            break;
                        }
                        default: {
                            throw "invalid preference";
                        }
                    }
                    delete user.sorted_preference;
                }
                //console.log(user.preference);
                var ret = [];
                for (var i = 0; i < count; i++) {
                    var s = user.preference.shift();
                    if (!!s) {
                        var shoe = shoes[s];
                        if (!!shoe) {
                            ret.push({ name: shoe.name, id: shoe.id, src: shoe.id + ".png", bullets: shoe.bullets, price: shoe.price, price_text: shoe.price + " $" });
                        }
                        else {
                            throw "invalid shoe id";
                        }
                    }
                }
                //console.log(ret);
                response.writeHead(200, jsonContent);
                response.end(JSON.stringify(ret));
            }
            catch (e) {
                response.writeHead(404, htmlContent);
                response.end("<!doctype html><html><body>invalid input</body></html>");
                console.log("invalid getshoes input", e);
            }
        });
    }
};
responseMap['/improve'] = function (response, request) {
    if (request.method == 'POST') {
        var data_3 = '';
        request.on('data', function (d) {
            data_3 += d;
        });
        request.on('end', function () {
            try {
                var d = JSON.parse(data_3);
                var id = d.id;
                if (typeof id == "undefined")
                    throw "no user id";
                var user = user_data[id];
                if (!user)
                    throw "invalid user id";
                var old_shoes = d.wl;
                if (typeof old_shoes == "undefined")
                    throw "invalid shoes sent";
                if (!d.recs)
                    throw "invalid recs sent";
                for (var _i = 0, _a = d.recs; _i < _a.length; _i++) {
                    var sid = _a[_i];
                    user.preference.push(sid);
                }
                switch (user.pref_name) {
                    case "Image": {
                        var best_shoe = void 0;
                        var c = 0;
                        for (var _b = 0, old_shoes_1 = old_shoes; _b < old_shoes_1.length; _b++) {
                            var key = old_shoes_1[_b];
                            var shoe = shoes[key];
                            if (!shoe)
                                continue;
                            if (typeof best_shoe == "undefined") {
                                best_shoe = shoe.image_embeddings;
                            }
                            else {
                                for (var _c = 0, _d = Object.keys(best_shoe); _c < _d.length; _c++) {
                                    var key_1 = _d[_c];
                                    best_shoe[key_1] += shoe.image_embeddings[key_1];
                                }
                            }
                            c++;
                        }
                        for (var _e = 0, _f = Object.keys(best_shoe); _e < _f.length; _e++) {
                            var key = _f[_e];
                            best_shoe[key] /= c;
                        }
                        user.preference = rank_by_images(user.preference, best_shoe);
                        break;
                    }
                    case "Review": {
                        var best_shoe = void 0;
                        var c = 0;
                        for (var _g = 0, old_shoes_2 = old_shoes; _g < old_shoes_2.length; _g++) {
                            var key = old_shoes_2[_g];
                            var shoe = shoes[key];
                            if (!shoe)
                                continue;
                            if (typeof best_shoe == "undefined") {
                                best_shoe = shoe.review_embeddings;
                            }
                            else {
                                for (var _h = 0, _j = Object.keys(best_shoe); _h < _j.length; _h++) {
                                    var key_2 = _j[_h];
                                    best_shoe[key_2] += shoe.review_embeddings[key_2];
                                }
                            }
                            c++;
                        }
                        for (var _k = 0, _l = Object.keys(best_shoe); _k < _l.length; _k++) {
                            var key = _l[_k];
                            best_shoe[key] /= c;
                        }
                        user.preference = rank_by_review_score(user.preference, best_shoe);
                        break;
                    }
                    case "Interaction": {
                        var best_shoe = void 0;
                        var c = 0;
                        for (var _m = 0, old_shoes_3 = old_shoes; _m < old_shoes_3.length; _m++) {
                            var key = old_shoes_3[_m];
                            var shoe = shoes[key];
                            if (!shoe)
                                continue;
                            if (typeof best_shoe == "undefined") {
                                best_shoe = shoe.interaction_embeddings;
                            }
                            else {
                                for (var _o = 0, _p = Object.keys(best_shoe); _o < _p.length; _o++) {
                                    var key_3 = _p[_o];
                                    best_shoe[key_3] += shoe.interaction_embeddings[key_3];
                                }
                            }
                            c++;
                        }
                        for (var _q = 0, _r = Object.keys(best_shoe); _q < _r.length; _q++) {
                            var key = _r[_q];
                            best_shoe[key] /= c;
                        }
                        user.preference = rank_by_review_score(user.preference, best_shoe);
                        break;
                    }
                    default: throw "invalid user preference";
                }
                //console.log(user);
                response.writeHead(200, jsonContent);
                response.end(JSON.stringify({ improved: true }));
            }
            catch (e) {
                console.log("queue improvement failed", e);
            }
        });
    }
};
var server = http.createServer(function (request, response) {
    var userurl = url.parse(request.url);
    var query = querystring.parse(userurl.query);
    //console.log("path:",userurl.pathname);
    try {
        responseMap[userurl.pathname](response, request);
    }
    catch (e) {
        if (userurl.pathname.slice(-4) == ".png") {
            var id = userurl.pathname.slice(1, 7);
            if (!shoes[id]) {
                response.writeHead(404, htmlContent);
                response.end("<!doctype html><html><body>image not found</body></html>");
                console.log("looking for unknown shoe id:", userurl.pathname, id, shoes[id]);
            }
            else {
                var pathname = "./images/" + id + ".png";
                try {
                    var image_file = fs.readFileSync(pathname);
                    response.writeHead(200, pngContent);
                    response.end(image_file, binary);
                }
                catch (e) {
                    console.log("no image for shoe in list found. this should not happen! remove 'shoes.json' and restart server.", pathname, e);
                }
            }
        }
        else {
            console.log(userurl.pathname, "not found", e);
            response.end();
        }
    }
});
server.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
