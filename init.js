const fs = require('fs');
const https = require('https');

const get = ({
  url
}) => {
  // https package isn't async so a promise wrap is required for
  // callers using this method with await/async methods
  return new Promise((resolve, reject) => {
    let data = '';
    https.get(url, (resp) => {

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(JSON.parse(data))
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject(err)
    });
  })

}

const get_internal_ip = async (debug = false) => {

  if (debug) {
    return Promise.resolve({
      status: 200,
      internalipaddress: "127.0.0.1"
    })
  }

  const url = 'https://discovery.meethue.com'
  const [res] = await get({
    url,
    method: 'GET'
  })

  if (res) {
    const {
      internalipaddress
    } = res

    return Promise.resolve({
      internalipaddress,
      status: 200
    })
  } else {
    console.log("Error: No Hue hub found!\n")
    return Promise.resolve({
      status: 404,
      internalipaddress: ''
    })
  }
}

const write_env_file = async (ip) => {
  const line = `INTERNALIPADDRESS=${ip}`
  fs.writeFile('.env', line, (err) => {
    if (err) throw err;

    console.log('Setting env variable "INTERNALIPADDRESS" to ' + ip)
    return Promise.resolve()
  });
}

async function init() {
  const DEBUG = true

  const result = await get_internal_ip(DEBUG)

  if (result.status != 200) {
    return
  }

  write_env_file(result.internalipaddress)
}

init()