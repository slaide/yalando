var http = require("http");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
function min(a, b) {
    if (b === void 0) { b = undefined; }
    if (typeof b == "undefined" && Array.isArray(a)) {
        var minimum = a[0];
        for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
            var e = a_1[_i];
            minimum = min(e, minimum);
        }
        return minimum;
    }
    return (a < b) ? a : b;
}
function max(a, b) {
    if (b === void 0) { b = undefined; }
    if (typeof b == "undefined" && Array.isArray(a)) {
        var maximum = a[0];
        for (var _i = 0, a_2 = a; _i < a_2.length; _i++) {
            var e = a_2[_i];
            maximum = max(e, maximum);
        }
        return maximum;
    }
    return (a > b) ? a : b;
}
function sum(a, b) {
    if (b === void 0) { b = undefined; }
    if (typeof b == "undefined") {
        if (Object.keys(a).length > 0) {
            var s = a[0];
            var index = 0;
            for (var _i = 0, _a = Object.keys(a); _i < _a.length; _i++) {
                var key = _a[_i];
                if (index != 0)
                    s = sum(s, a[key]);
                index += 1;
            }
            return s;
        }
        else {
            return a || 0;
        }
    }
    else {
        if (typeof a == "undefined") {
            return sum(b);
        }
        else {
            var a_keys = Object.keys(a);
            var b_keys = Object.keys(b);
            if (a_keys.length > 0 && b_keys.length > 0) {
                var s = [];
                for (var _b = 0, a_keys_1 = a_keys; _b < a_keys_1.length; _b++) {
                    var key = a_keys_1[_b];
                    s.push(sum(a[key], b[key]));
                }
                return s;
            }
            else {
                var nan_protect_a = parseFloat(a);
                var nan_protect_b = parseFloat(b);
                if (isNaN(nan_protect_a)) {
                    return isNaN(nan_protect_b) ? 0 : nan_protect_b;
                }
                else {
                    var nan_protect_sum = nan_protect_a + nan_protect_b;
                    return isNaN(nan_protect_sum) ? nan_protect_a : nan_protect_sum;
                }
            }
        }
    }
}
function shuffle_array(a) {
    var _a;
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
    }
    return a;
}
function abs(v) {
    return (v < 0) ? -v : v;
}
var hostname = '127.0.0.1';
var port = process.env.PORT || 3000;
var utf8 = { encoding: "utf8" };
var binary = { encoding: "binary" };
var htmlContent = { "Content-Type": "text/html" };
var cssContent = { "Content-Type": "text/css" };
var pngContent = { "Content-Type": "image/png" };
var jpgContent = { "Content-Type": "image/jpg" };
var icoContent = { "Content-Type": "image/x-icon" };
var jsContent = { "Content-Type": "application/javascript" };
var jsonContent = { "Content-Type": "application/json" };
var page = fs.readFileSync("start.html", utf8);
var responseMap = {};
responseMap["/favicon.ico"] = function (response, request) {
    response.writeHead(200, icoContent);
    response.end(fs.readFileSync("favicon.ico"), binary);
};
responseMap["/adidas-logo.jpg"] = function (response, request) {
    response.writeHead(200, jpgContent);
    response.end(fs.readFileSync("adidas-logo.jpg"), binary);
};
responseMap["/script.js"] = function (response, request) {
    response.writeHead(200, jsContent);
    var scriptFile = fs.readFileSync("script.js", utf8);
    response.end(scriptFile, utf8);
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
function shoe_fits_gender(shoe, gender) {
    switch (gender) {
        case "Woman": {
            if ((shoe.gender != "FEMALE" && shoe.gender != "UNISEX") || shoe.age != "A")
                return false;
            break;
        }
        case "Man": {
            if ((shoe.gender != "MALE" && shoe.gender != "UNISEX") || shoe.age != "A")
                return false;
            break;
        }
        case "Adult": {
            if (shoe.age != "A")
                return false;
            break;
        }
        case "Girl": {
            if ((shoe.gender != "FEMALE" && shoe.gender != "UNISEX") || (shoe.age != "J" && shoe.age != "I" && shoe.age != "K"))
                return false;
            break;
        }
        case "Boy": {
            if ((shoe.gender != "MALE" && shoe.gender != "UNISEX") || (shoe.age != "J" && shoe.age != "I" && shoe.age != "K"))
                return false;
            break;
        }
        case "Child": {
            if (shoe.age != "J" && shoe.age != "I" && shoe.age != "K")
                return false;
            break;
        }
        default: {
            throw Error("unknown gender? " + gender);
        }
    }
    return true;
}
function init_shoes() {
    var shoes_ret = {};
    var shoe_path = "./shoes.json";
    try {
        var file = fs.readFileSync(shoe_path, utf8);
        shoes_ret = JSON.parse(file);
    }
    catch (_a) {
        console.log("generating data..");
        var csv = require('csv-parse');
        var parsecsv = require('csv-parse/lib/sync');
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
        //parse shoes from array into hashmap (lookup by id)
        for (var s_i = 0; s_i < shoes_1.length; s_i++) {
            shoes_ret[shoes_1[s_i].id] = shoes_1[s_i];
        }
        console.log("#shoes with metadata", Object.keys(shoes_ret).length);
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
        console.log("#shoes with image embeddings", Object.keys(shoes_ret).length);
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
        //fetch list of review words from first shoe where there are at least some review words
        shoe_keys = Object.keys(shoes_ret);
        var review_keys_list = [];
        for (var _j = 0, shoe_keys_2 = shoe_keys; _j < shoe_keys_2.length; _j++) {
            var key = shoe_keys_2[_j];
            var review_keys = Object.keys(shoes_ret[key].review_embeddings);
            if (review_keys.length >= 1) {
                if (review_keys_list.length == 0) {
                    review_keys_list = review_keys;
                    break;
                }
            }
        }
        //this code sets the review embeddings for every shoe which has none to a zero vector, which is a garbage approach but so be it
        //TODO make up something useful
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
        console.log("#shoes with review embeddings", Object.keys(shoes_ret).length, "(though those without were given one)");
        for (var d_i in interaction_embeddings) {
            var d = interaction_embeddings[d_i];
            var shoe = shoes_ret[d.article];
            if (shoe) {
                for (var _m = 0, _o = Object.keys(d); _m < _o.length; _m++) {
                    var key = _o[_m];
                    if (key === "article" || key.length === 0)
                        continue;
                    shoes_ret[d.article].interaction_embeddings.push(d[key]);
                }
            }
        }
        shoe_keys = Object.keys(shoes_ret);
        for (var _p = 0, shoe_keys_4 = shoe_keys; _p < shoe_keys_4.length; _p++) {
            var shoe_key = shoe_keys_4[_p];
            var shoe = shoes_ret[shoe_key];
            if (shoe.interaction_embeddings.length < 1)
                delete shoes_ret[shoe_key];
        }
        console.log("#shoes with interaction embeddings", Object.keys(shoes_ret).length);
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
        console.log("#shoes with image", Object.keys(shoes_ret).length);
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
        console.log("longest sub name of a shoe:", longest_name, "(necessary info for some interface scaling issues)");
        console.log("saving generated data..");
        fs.writeFileSync("./shoes.json", JSON.stringify(shoes_ret), utf8);
        console.log("saved");
    }
    return shoes_ret;
}
var shoes = init_shoes();
var shoe_ids = Object.keys(shoes);
console.log("fit shoes found: ", shoe_ids.length);
function get_user_recommendations(user) {
    var search_id = false;
    var id = undefined;
    for (var _i = 0, _a = user.query.split(" "); _i < _a.length; _i++) {
        var word = _a[_i];
        if (word.slice(0, 3) == "id:") {
            search_id = true;
            id = word.slice(3);
        }
    }
    var shoe_keys = [];
    if (search_id) {
        var id_shoe_1 = shoes[id];
        if (!id_shoe_1)
            throw Error("id (" + id + ") does not exist, but was explicitely searched for");
        shoe_keys = shoe_ids.slice().filter(function (key) {
            var shoe = shoes[key];
            var gender = "";
            switch (id_shoe_1.age) {
                case "I":
                case "J":
                case "K": {
                    switch (id_shoe_1.gender) {
                        case "UNISEX": {
                            gender = "Child";
                            break;
                        }
                        case "FEMALE": {
                            gender = "Girl";
                            break;
                        }
                        case "MALE": {
                            gender = "Boy";
                            break;
                        }
                    }
                    break;
                }
                case "A": {
                    switch (id_shoe_1.gender) {
                        case "UNISEX": {
                            gender = "Adult";
                            break;
                        }
                        case "FEMALE": {
                            gender = "Woman";
                            break;
                        }
                        case "MALE": {
                            gender = "Man";
                            break;
                        }
                    }
                    break;
                }
            }
            return shoe_fits_gender(shoe, gender);
        });
    }
    else {
        for (var _b = 0, shoe_ids_1 = shoe_ids; _b < shoe_ids_1.length; _b++) {
            var key = shoe_ids_1[_b];
            var shoe = shoes[key];
            if (!shoe_fits_gender(shoe, user.gender.name)) {
                continue;
            }
            var word_found = false;
            var discard_shoe = false;
            var ignore_category = false;
            var user_query_words = user.query.toLowerCase().split(" ");
            for (var _c = 0, user_query_words_1 = user_query_words; _c < user_query_words_1.length; _c++) {
                var word = user_query_words_1[_c];
                if (discard_shoe)
                    break;
                if (shoe.review_embeddings[word])
                    ignore_category = true;
                switch (word) {
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
            for (var _d = 0, user_query_words_2 = user_query_words; _d < user_query_words_2.length; _d++) {
                var word = user_query_words_2[_d];
                if (discard_shoe)
                    break;
                switch (word) {
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
                }
            }
            //discard football shoes if user does not explicitely search for football shoes
            if (user_query_words.indexOf("soccer") == -1 && shoe.category == "FOOTBALL/SOCCER")
                discard_shoe = true;
            if (discard_shoe)
                continue;
            shoe_keys.push(key);
        }
    }
    //console.log("found this many shoes for a new user:",shoe_keys.length);
    var ret = { image: [], review: [], interaction: [], randomized: { review: false, image: false, interaction: false } };
    var review_ranked = rank_by_reviews(shoe_keys, user);
    //if no review words are found, randomize search results and signal to the client that all queues are random (though only one is sent because sending multiple completely random queues is confusing)
    if (review_ranked.ms < 0.0000001 && !search_id) {
        var shuffled_shoes = shuffle_array(review_ranked.r.slice());
        ret.review = shuffled_shoes;
        ret.image = [];
        ret.interaction = [];
        ret.randomized.review = true;
        ret.randomized.image = true;
        ret.randomized.interaction = true;
        user.all_queues_random = true;
    }
    else if (search_id) {
        var best_shoe = shoes[id];
        ret.review = rank_by_review_score(shoe_keys, best_shoe.review_embeddings);
        //if first shoe is not the searched one, its review embeddings are all 0 (which is also the case for many others), so randomize results, but still put the specified one in the front
        if (ret.review[0] != id) {
            shuffle_array(ret.review);
            var index = ret.review.findIndex(function (k) { return k == id; });
            if (!index)
                throw "id not found that should definitely be there!";
            var temp = ret.review[0];
            ret.review[0] = ret.review[index];
            ret.review[index] = temp;
            ret.randomized.review = true;
        }
        ret.image = rank_by_images(shoe_keys, best_shoe.image_embeddings);
        ret.interaction = rank_by_interactions(shoe_keys, best_shoe.interaction_embeddings);
    }
    else {
        ret.review = review_ranked.r;
        var best_shoe = shoes[ret.review[0]];
        var best_image_score = best_shoe.image_embeddings;
        ret.image = rank_by_images(shoe_keys, best_image_score);
        var best_interaction_score = best_shoe.interaction_embeddings;
        ret.interaction = rank_by_interactions(shoe_keys, best_interaction_score);
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
            if (rs)
                s += parseFloat(rs);
        }
        return s;
    };
    var max_score = 0.0;
    var scores = {};
    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
        var key = keys_2[_i];
        var s = score(key);
        scores[key] = s;
        if (s > max_score)
            max_score = s;
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return { r: ret, ms: max_score };
}
function rank_by_images(keys, best_score) {
    var scores = {};
    for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
        var key = keys_3[_i];
        scores[key] = cos_similarity(shoes[key].image_embeddings, best_score);
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    var max_score = 0.0;
    for (var _a = 0, keys_4 = keys; _a < keys_4.length; _a++) {
        var key = keys_4[_a];
        max_score = Math.max(scores[key], max_score);
    }
    console.log(max_score);
    return ret;
}
function rank_by_interactions(keys, best_score) {
    var scores = {};
    for (var _i = 0, keys_5 = keys; _i < keys_5.length; _i++) {
        var key = keys_5[_i];
        scores[key] = cos_similarity(shoes[key].interaction_embeddings, best_score);
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return ret;
}
function rank_by_review_score(keys, best_score) {
    var scores = {};
    for (var _i = 0, keys_6 = keys; _i < keys_6.length; _i++) {
        var key = keys_6[_i];
        scores[key] = cos_similarity(shoes[key].review_embeddings, best_score);
    }
    var ret = keys.slice().sort(function (s1, s2) { return scores[s2] - scores[s1]; });
    return ret;
}
function cos_similarity(a, b) {
    var ret = 0.0;
    var a_length = 0.0;
    var b_length = 0.0;
    for (var _i = 0, _a = Object.keys(a); _i < _a.length; _i++) {
        var key = _a[_i];
        var a_value = parseFloat(a[key]);
        var b_value = parseFloat(b[key]);
        ret += a_value * b_value;
        a_length += a_value * a_value;
        b_length += b_value * b_value;
    }
    a_length = Math.sqrt(a_length);
    b_length = Math.sqrt(b_length);
    ret /= a_length * b_length;
    if (isNaN(ret)) {
        ret = 0.0;
    }
    ret = Math.abs(ret);
    return ret;
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
                user.all_queues_random = false;
                var id = user_data.next_id;
                user_data.next_id++;
                //console.log(user);
                user.sorted_preference = get_user_recommendations(user);
                user_data[id] = user;
                var sorted_snippet = { image: [], interaction: [], review: [], randomized: user.sorted_preference.randomized };
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
                console.log("invalid senduser input: ", e.message);
                response.end();
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
                var _loop_1 = function (i) {
                    var s = user.preference.shift();
                    if (!!s) {
                        var shoe_1 = shoes[s];
                        if (!!shoe_1) {
                            var word_keys = Object.keys(shoe_1.review_embeddings);
                            word_keys.sort(function (w1, w2) {
                                return shoe_1.review_embeddings[w2] - shoe_1.review_embeddings[w1];
                            });
                            var words = word_keys.slice(0, 5);
                            ret.push({ name: shoe_1.name, id: shoe_1.id, src: shoe_1.id + ".png", bullets: shoe_1.bullets, price: shoe_1.price, price_text: shoe_1.price + " $", words: words });
                        }
                        else {
                            throw "invalid shoe id";
                        }
                    }
                };
                for (var i = 0; i < count; i++) {
                    _loop_1(i);
                }
                //console.log(ret);
                response.writeHead(200, jsonContent);
                response.end(JSON.stringify(ret));
            }
            catch (e) {
                response.writeHead(404, htmlContent);
                response.end("<!doctype html><html><body>invalid input</body></html>");
                console.log("invalid getshoes input: ", e.message ? e.message : e);
                throw e;
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
                    throw "invalid user id";
                var user = user_data[id];
                if (!user)
                    throw "invalid user id";
                var wishlisted = d.wl;
                if (!wishlisted)
                    throw "invalid wishlist contents";
                var recs = d.recs;
                if (!recs)
                    throw "invalid recommendation contents";
                for (var _i = 0, recs_1 = recs; _i < recs_1.length; _i++) {
                    var key = recs_1[_i];
                    if (!!key)
                        user.recommendations.push(key);
                }
                if (!!user.all_queues_random) {
                    var image_scores = [];
                    var temp_embeddings = [];
                    //create list with embedding of each wishlisted shoe
                    for (var _a = 0, wishlisted_1 = wishlisted; _a < wishlisted_1.length; _a++) {
                        var shoe_key = wishlisted_1[_a];
                        if (typeof shoe_key == "undefined" || shoe_key.length == 0)
                            continue;
                        if (typeof shoes[shoe_key] == "undefined")
                            throw new Error("shoe for id not found. what? " + shoe_key);
                        temp_embeddings.push(shoes[shoe_key].image_embeddings);
                    }
                    //get emebdding of first shoe to build average embedding
                    var average_embedding = temp_embeddings[0];
                    //for each wishlisted shoe (after the first)
                    for (var _b = 0, _c = temp_embeddings.slice(1); _b < _c.length; _b++) {
                        var embedding = _c[_b];
                        //for each key of the embedding
                        for (var _d = 0, _e = Object.keys(embedding); _d < _e.length; _d++) {
                            var key = _e[_d];
                            //add indexed value to to-be-averaged-embedding
                            average_embedding[key] += embedding[key];
                        }
                    }
                    for (var _f = 0, _g = Object.keys(average_embedding); _f < _g.length; _f++) {
                        var key = _g[_f];
                        average_embedding[key] /= temp_embeddings.length;
                    }
                    for (var _h = 0, temp_embeddings_1 = temp_embeddings; _h < temp_embeddings_1.length; _h++) {
                        var embedding = temp_embeddings_1[_h];
                        image_scores.push(embedding, average_embedding);
                    }
                    var review_scores = [];
                    temp_embeddings = [];
                    //create list with embedding of each wishlisted shoe
                    for (var _j = 0, wishlisted_2 = wishlisted; _j < wishlisted_2.length; _j++) {
                        var shoe_key = wishlisted_2[_j];
                        if (typeof shoe_key == "undefined" || shoe_key.length == 0)
                            continue;
                        if (typeof shoes[shoe_key] == "undefined")
                            throw new Error("shoe for id not found. what? " + shoe_key);
                        temp_embeddings.push(shoes[shoe_key].review_embeddings);
                    }
                    //get emebdding of first shoe to build average embedding
                    average_embedding = temp_embeddings[0];
                    //for each wishlisted shoe (after the first)
                    for (var _k = 0, _l = temp_embeddings.slice(1); _k < _l.length; _k++) {
                        var embedding = _l[_k];
                        //for each key of the embedding
                        for (var _m = 0, _o = Object.keys(embedding); _m < _o.length; _m++) {
                            var key = _o[_m];
                            //add indexed value to to-be-averaged-embedding
                            average_embedding[key] += embedding[key];
                        }
                    }
                    for (var _p = 0, _q = Object.keys(average_embedding); _p < _q.length; _p++) {
                        var key = _q[_p];
                        average_embedding[key] /= temp_embeddings.length;
                    }
                    for (var _r = 0, temp_embeddings_2 = temp_embeddings; _r < temp_embeddings_2.length; _r++) {
                        var embedding = temp_embeddings_2[_r];
                        review_scores.push(embedding, average_embedding);
                    }
                    var interaction_scores = [];
                    temp_embeddings = [];
                    //create list with embedding of each wishlisted shoe
                    for (var _s = 0, wishlisted_3 = wishlisted; _s < wishlisted_3.length; _s++) {
                        var shoe_key = wishlisted_3[_s];
                        if (typeof shoe_key == "undefined" || shoe_key.length == 0)
                            continue;
                        if (typeof shoes[shoe_key] == "undefined")
                            throw new Error("shoe for id not found. what? " + shoe_key);
                        temp_embeddings.push(shoes[shoe_key].interaction_embeddings);
                    }
                    //get emebdding of first shoe to build average embedding
                    average_embedding = temp_embeddings[0];
                    //for each wishlisted shoe (after the first)
                    for (var _t = 0, _u = temp_embeddings.slice(1); _t < _u.length; _t++) {
                        var embedding = _u[_t];
                        //for each key of the embedding
                        for (var _v = 0, _w = Object.keys(embedding); _v < _w.length; _v++) {
                            var key = _w[_v];
                            //add indexed value to to-be-averaged-embedding
                            average_embedding[key] += embedding[key];
                        }
                    }
                    for (var _x = 0, _y = Object.keys(average_embedding); _x < _y.length; _x++) {
                        var key = _y[_x];
                        average_embedding[key] /= temp_embeddings.length;
                    }
                    for (var _z = 0, temp_embeddings_3 = temp_embeddings; _z < temp_embeddings_3.length; _z++) {
                        var embedding = temp_embeddings_3[_z];
                        interaction_scores.push(embedding, average_embedding);
                    }
                    var abs_image = abs(sum(sum(image_scores)));
                    var abs_review = abs(sum(sum(review_scores)));
                    var abs_interaction = abs(sum(sum(interaction_scores)));
                    var abs_vector = [abs_image, abs_review, abs_interaction];
                    switch (abs_vector.indexOf(min(abs_vector))) {
                        case 0: {
                            user.pre_name = "Image";
                            console.log("switched random queue to image queue", abs_vector);
                            break;
                        }
                        case 1: {
                            user.pre_name = "Review";
                            console.log("switched random queue to review queue", abs_vector);
                            break;
                        }
                        case 2: {
                            user.pre_name = "Interaction";
                            console.log("switched random queue to interaction queue", abs_vector);
                            break;
                        }
                        default: throw new Error("unknown minimum preference");
                    }
                    user.all_queues_random = false;
                }
                switch (user.pref_name) {
                    case "Image": {
                        var best_shoe = void 0;
                        var c = 0;
                        //calc median vector of embeddings of wishlisted shoes as best shoe embeddings
                        for (var _0 = 0, wishlisted_4 = wishlisted; _0 < wishlisted_4.length; _0++) {
                            var key = wishlisted_4[_0];
                            var shoe = shoes[key];
                            if (!shoe)
                                continue; //throw "image, invalid shoe id "+key;
                            //console.log(key);
                            if (typeof best_shoe == "undefined") {
                                best_shoe = {};
                                for (var _1 = 0, _2 = Object.keys(shoe.image_embeddings); _1 < _2.length; _1++) {
                                    var image_key = _2[_1];
                                    best_shoe[image_key] = parseFloat(shoe.image_embeddings[image_key]);
                                }
                            }
                            else {
                                for (var _3 = 0, _4 = Object.keys(best_shoe); _3 < _4.length; _3++) {
                                    var key_1 = _4[_3];
                                    best_shoe[key_1] += parseFloat(shoe.image_embeddings[key_1]);
                                }
                            }
                            c++;
                        }
                        //console.log(c);
                        for (var _5 = 0, _6 = Object.keys(best_shoe); _5 < _6.length; _5++) {
                            var key = _6[_5];
                            best_shoe[key] /= c;
                        }
                        //console.log(best_shoe);
                        for (var _7 = 0, recs_2 = recs; _7 < recs_2.length; _7++) {
                            var key = recs_2[_7];
                            user.preference.push(key);
                        }
                        user.preference = rank_by_images(user.preference, best_shoe);
                        break;
                    }
                    case "Review": {
                        var best_shoe = void 0;
                        var c = 0;
                        for (var _8 = 0, wishlisted_5 = wishlisted; _8 < wishlisted_5.length; _8++) {
                            var key = wishlisted_5[_8];
                            var shoe = shoes[key];
                            if (!shoe)
                                continue; //throw "review, invalid shoe id "+key;
                            if (typeof best_shoe == "undefined") {
                                best_shoe = {};
                                for (var _9 = 0, _10 = Object.keys(shoe.review_embeddings); _9 < _10.length; _9++) {
                                    var image_key = _10[_9];
                                    best_shoe[image_key] = parseFloat(shoe.review_embeddings[image_key]);
                                }
                            }
                            else {
                                for (var _11 = 0, _12 = Object.keys(best_shoe); _11 < _12.length; _11++) {
                                    var key_2 = _12[_11];
                                    best_shoe[key_2] += parseFloat(shoe.review_embeddings[key_2]);
                                }
                            }
                            c++;
                        }
                        for (var _13 = 0, _14 = Object.keys(best_shoe); _13 < _14.length; _13++) {
                            var key = _14[_13];
                            best_shoe[key] /= c;
                        }
                        for (var _15 = 0, recs_3 = recs; _15 < recs_3.length; _15++) {
                            var key = recs_3[_15];
                            user.preference.push(key);
                        }
                        user.preference = rank_by_review_score(user.preference, best_shoe);
                        break;
                    }
                    case "Interaction": {
                        var best_shoe = void 0;
                        var c = 0;
                        for (var _16 = 0, wishlisted_6 = wishlisted; _16 < wishlisted_6.length; _16++) {
                            var key = wishlisted_6[_16];
                            var shoe = shoes[key];
                            if (!shoe)
                                continue; //throw "interaction, invalid shoe id "+key;
                            if (typeof best_shoe == "undefined") {
                                best_shoe = {};
                                for (var _17 = 0, _18 = Object.keys(shoe.interaction_embeddings); _17 < _18.length; _17++) {
                                    var image_key = _18[_17];
                                    best_shoe[image_key] = parseFloat(shoe.interaction_embeddings[image_key]);
                                }
                            }
                            else {
                                for (var _19 = 0, _20 = Object.keys(best_shoe); _19 < _20.length; _19++) {
                                    var key_3 = _20[_19];
                                    best_shoe[key_3] += parseFloat(shoe.interaction_embeddings[key_3]);
                                }
                            }
                            c++;
                        }
                        for (var _21 = 0, recs_4 = recs; _21 < recs_4.length; _21++) {
                            var key = recs_4[_21];
                            user.preference.push(key);
                        }
                        for (var _22 = 0, _23 = Object.keys(best_shoe); _22 < _23.length; _22++) {
                            var key = _23[_22];
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
                console.log("queue improvement failed because:", e, e.message);
                response.end();
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
                    console.log("no image for shoe in list found. this should not happen! remove 'shoes.json' and restart server. (image path:", pathname, " and error message:", e.message, ")");
                }
            }
        }
        else {
            console.log("warning:", userurl.pathname + " not found");
            response.end();
        }
    }
});
server.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
