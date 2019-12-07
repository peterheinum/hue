const get = async ({ url, body, method }) => await fetch(url, { body: JSON.stringify(body), method }).then(res => res.json())

let _temperature = 0
let _color = 0

const getLights = async ({ id, temperature }) => {
  // aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh
  // const url = `http://192.168.1.99/api/${localStorage.getItem('api_key')}/lights/${id}/`
  const url = `http://192.168.1.90/api/${localStorage.getItem('api_key')}/lights/${id}/`
  const method = 'GET'
  get({ url, method })
}

const setLights = async ({ id, temperature, color }) => {
  if (temperature - _temperature > 0.05 || temperature - _temperature < -0.05) {
    // const url = `http://192.168.1.99/api/${localStorage.getItem('api_key')}/lights/${id}/state`
    const url = `http://192.168.1.90/api/${localStorage.getItem('api_key')}/lights/${id}/state`

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

  if (temperature > 0.5 || _color + Math.floor(_color * temperature) < 1500) {
    color = _color + Math.floor(_color * temperature)
  }
  if (temperature < 0.5 || _color + Math.floor(_color * temperature) > 65535) {
    color = _color - Math.floor(_color * temperature)

  }
  // console.log(temperature)
  if (color < 3500 || color > 65535) {
    // console.log('saved color', color)
    // console.log(temperature)
    color = Math.floor(temperature * 65535)
  }

  setLights({ id: 4, temperature, color })
  setLights({ id: 5, temperature, color })
  setLights({ id: 6, temperature, color })
  _color = color
  _temperature = temperature
}
// const setLights = async ({ color, s, brightness, id }) => {
//   const url = `http://192.168.1.90/api/${localStorage.getItem('api_key')}/lights/${id}/state`
//   const body = { 'on': true, 'sat': 200, 'bri': Math.floor(200 * 0.8), "hue": color }
//   const method = 'PUT'
//   const res = await get({ url, body, method })
//   console.log(res)
//   console.log(color)
// }


function changeLights(data) {
  const array1 = []
  const array2 = []
  const array3 = []

  for (let i = 0; i < data.length; i++) {
    if(i < 20) {
      data[i].magnitude && array1.push(data[i].magnitude)
    }
    
    else if(i < 40) {
      data[i].magnitude && array2.push(data[i].magnitude)
    }

    else if(i < 61) {
      data[i].magnitude && array3.push(data[i].magnitude)
    }
  }

  const sum = arr => arr.reduce((a, b) => a + b, 0)
  const sum1 = sum(array1)
  const sum2 = sum(array2)
  const sum3 = sum(array3)
  console.log(sum1, sum2, sum3)

  const { red, blue, green } = data.reduce((acc, cur) => {
    acc[cur.color] ? acc[cur.color] = acc[cur.color] + cur.magnitude : acc[cur.color] = cur.magnitude
    return acc
  }, {})
  const r = (red / 1600 * 255)
  const b = (blue / 1600 * 255)
  const g = (green / 1600 * 255)
  const [h, s, l] = rgbToHsl({ r, g, b })
  // const color = (h/360*65000)
  const color = Math.random() * 65535
  console.log(h)

  const brightness = l/100
  setLights({color, s, brightness, id: 4})
  setLights({color, s, brightness, id: 5})
  setLights({color, s, brightness, id: 6})
}

const rgbToHsl = ({ r, g, b }) => {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

const asyncConnect = async () => {
  // const url = 'http://192.168.1.90/api/'
  // const response = await get({ url, body: {"devicetype":"my_hue_app#eliasplace"}, method: 'POST'})
  // localStorage.setItem('api_key', response)
  const url = `http://192.168.1.90/api/${localStorage.getItem('api_key')}/lights/`
  const response = await get({ url, method: 'GET' })
  console.log(response)
}

function connect() {
  asyncConnect()
  //Gör anrop till philips hue

  //Fråga om credentials
  //Få nyckel
  //spara nyckel i localstorage
}

const _red = temp => 24000 * temp + 40000
const _green = temp => 24000 * temp + 20000
const _blue = temp => 24000 * temp