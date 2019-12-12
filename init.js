const fs = require('fs');

const get = async ({
  url,
  body,
  method
}) => {
  return Promise.resolve()
}

const get_internal_ip = async (debug = false) => {

  if (debug) {
    return Promise.resolve("localhost")
  }

  const url = 'https://discovery.meethue.com/'
  const [res] = await get({
    url,
    method: 'GET'
  })

  if (res) {
    const {
      internalipaddress
    } = res

    return Promise.resolve(internalipaddress)
  } else {
    create_error({
      text: 'No hue found',
      font_size: 18
    })
  }
}

const write_env_file = async (ip) => {
  const line = `INTERNALIPADDRESS=${ip}`
  fs.writeFile('.env', line, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log("Setting internal ip address to " + ip)
    return Promise.resolve()
  });
}

get_internal_ip(true).then(async res => {
  write_env_file(res)
})