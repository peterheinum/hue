const get = async ({ url, body, method }) => await fetch(url, { body: JSON.stringify(body), method }).then(res => res.json())

let _temperature = 0
let _color = 0

const getLights = async ({ id, temperature }) => {
  const url = `http://192.168.1.99/api/aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh/lights/${id}/`
  const method = 'GET'
  get({ url, method })
}

const setLights = async ({ id, temperature, color }) => {
  if (temperature - _temperature > 0.05 || temperature - _temperature < -0.05) {
    const url = `http://192.168.1.99/api/aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh/lights/${id}/state`

    const body = { 'on': true, 'sat': 254, 'bri': Math.floor(200 * temperature), "hue": color }
    console.log(color)
    const method = 'PUT'
    get({ url, body, method })
  }
}


function drawBuffer(data) {
  let temperature = 0;

  for (let i = 0; i < data.length; i++) {
    if (temperature < data[i]) {
      temperature = data[i];
    }
  }
  let color = 0

  if(temperature > 0.5 || _color + Math.floor(_color * temperature) < 1500) {
    color = _color + Math.floor(_color * temperature)
  } 
  if(temperature < 0.5 || _color + Math.floor(_color * temperature) > 65535) {
    color = _color - Math.floor(_color * temperature)
  }

  if(color < 1500 || color > 65535) {
    console.log('saved color', color)
    console.log(temperature)
    color = Math.floor(temperature * 65535)
  }
  
  setLights({ id: 1, temperature, color })
  setLights({ id: 2, temperature, color })
  _color = color
  _temperature = temperature
}
