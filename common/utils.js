const fetch = require("node-fetch");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const RESTART_UTC_HOUR = 17;
const SECONDS_PER_HOUR = 3600;

var up_min = 0;

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function computeHash(password, salt, fn) {
	// Bytesize
	var len = config.CRYPTO_BYTE_SIZE;
	var iterations = 4096;

	if (3 == arguments.length) {
		crypto.pbkdf2(password, salt, iterations, len, fn);
	} else {
		fn = salt;
		crypto.randomBytes(len, function(err, salt) {
			if (err) return fn(err);
			salt = salt.toString('base64');
			crypto.pbkdf2(password, salt, iterations, len, 'sha512', function(err, derivedKey) {
				if (err) return fn(err);
				fn(null, salt, derivedKey.toString('base64'));
			});
		});
	}
}

const fetchWithTimeout = async (url, options, time) => {
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, time);
    let config = { ...options, signal: controller.signal };
    try {
      let response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
      return "";
    }
  }

const curlGet = async (url) => {
    try {
        const { stdout, stderr } = await exec(`curl -s ${url}`, {timeout: 20000,maxBuffer: 2048 * 1000});
        if (stderr) {
            console.log('curl error:' + stderr);
            throw new Error(stderr);
        }
        return stdout;
    } catch (e) {
        console.log(`error getting ${url}: ${e}`);
        throw new Error(`curl error: ${e}`);
    }
}

const trimSearchKeywords = async (brand, title) => {

    let trimTitle = '';
    if (!title || title.indexOf('Mobile管理訊息')!==-1) {
        return null;
    }

	trimTitle = title.substring(title.indexOf('】')+1);

	// remove quantity decorators
	let pattern = new RegExp("[\u4E00-\u9FA5][0-9]");
	index = trimTitle.search(pattern);
	if (index>0) {
		trimTitle = trimTitle.substring(0, index+1); 
	}
    console.log(trimTitle);
	pattern = new RegExp("[ xX|-][0-9]");
	index = trimTitle.search(pattern);
	if (index>0) {
		trimTitle = trimTitle.substring(0, index);
	}
    console.log(trimTitle);


	// Remove postfix "- momo購物網"
	index = Math.max(trimTitle.indexOf('- momo'), trimTitle.indexOf('-momo'));;
	if (index!==-1) {
		trimTitle = trimTitle.substring(0, index);
	}

	// Remove chars after "("
	index = trimTitle.indexOf('(');
	if (index!==-1) {
		trimTitle = trimTitle.substring(0, index);
	}

    // Remove brand
    trimTitle  = trimTitle.replace(brand, "");

    return trimTitle;
}

function wait(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

const checkRestart = () => {
    let date = new Date();
    let hour = date.getUTCHours();
    if (hour===RESTART_UTC_HOUR && up_min > 70) {
        // exit();
        console.log('restart should work now, reset up_min');
        up_min = 0;
    } else {
        up_min++;
    }
}

const convertTZ = (date, tzString) => {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}


module.exports = {
    isJsonString: isJsonString,
    fetchWithTimeout: fetchWithTimeout,
    curlGet: curlGet,
    trimSearchKeywords: trimSearchKeywords,
    wait: wait,
    checkRestart: checkRestart,
    convertTZ: convertTZ,
    computeHash: computeHash,
    SECONDS_PER_HOUR: SECONDS_PER_HOUR
}
