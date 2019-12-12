const get = async ({ url, body, method }) => await fetch(url, { body: JSON.stringify(body), method }).then(res => res.json())
const _lights = () => localStorage.getItem('lights') ? localStorage.getItem('lights').split(',') : []

let _temperature = 0
let _color = 0

const getLights = async id => {
  const url = `http://${localStorage.getItem('internalipaddress')}/api/${localStorage.getItem('api_key')}/lights/${id}/`
  const method = 'GET'
  const result = await get({ url, method })
  return Promise.resolve(result)
}

const setLights = async ({ id, temperature, color }) => {
  if (temperature - _temperature > 0.05 || temperature - _temperature < -0.05) {
    const url = `http://${localStorage.getItem('internalipaddress')}/api/${localStorage.getItem('api_key')}/lights/${id}/state`
    const body = { 'on': true, 'sat': 254, 'bri': Math.floor(200 * temperature), "hue": color }
    const method = 'PUT'
    get({ url, body, method })
  }
}

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

const spin = () => {
  const colors = []
  _lights().forEach((_, i) => i == 0 ? colors.push(65000) : colors.push(48000))

  let spins = 0
  let interval = setInterval(() => {
    colors.move(0, colors.length-1)
    _lights().forEach((id, i) => {
      const color = colors[i]
      setLights({id, temperature: 0.5, color })
    })
    spins++
    spins == 100 && clearInterval(interval)
  }, 1000)
}


let errorActive = false

const create_error = ({ text = 'error', font_size }) => {
  errorActive = true
  let el = document.querySelector('#connectBtn')
  el.style.backgroundColor = '#e6172f'

  setTimeout(() => {
    explosion_colors.splice(0, explosion_colors.length)
    explosion_colors.push('#f2465a', '#a82f3d', '#781722')
  }, 50);

  el.innerHTML = text
  font_size && (el.style.fontSize = font_size + 'px')

  setTimeout(() => {
    errorActive = false
    el.style.fontSize = '2rem'
    el.style.backgroundColor = '#0069ed'
    el.innerHTML = 'Connect'
    explosion_colors.splice(0, explosion_colors.length)
    explosion_colors.push('#57a1ff', '#33629e', '#1c395e')
  }, 5000);
}

const create_success = () => {
  let el = document.querySelector('#connectBtn')
  el.style.backgroundColor = '#18ed51'
  el.innerHTML = 'Connected'

  explosion_colors.splice(0, explosion_colors.length)
  explosion_colors.push('#32c259', '#1d8238', '#51f07c')
  spin()
}

const get_internal_ip = async () => {
  if (localStorage.getItem('internalipaddress')) return Promise.resolve()
  const url = 'https://discovery.meethue.com/'
  const [res] = await get({ url, method: 'GET' })

  if (res) {
    const { internalipaddress } = res
    localStorage.setItem('internalipaddress', internalipaddress)
    return Promise.resolve()
  }
  else {
    create_error({ text: 'No hue found', font_size: 18 })
  }
}

const get_hue_token = async () => {
  if (localStorage.getItem('api_key')) return Promise.resolve()
  const url = `http://${localStorage.getItem('internalipaddress')}/api/`
  const [response] = await get({ url, body: { "devicetype": "my_hue_app#1337" }, method: 'POST' })
  const { error, success } = response
  if (!error) {
    const { username } = success
    localStorage.setItem('api_key', username)
    return Promise.resolve()
  }
  else {
    create_error({ text: 'Click connect on bridge', font_size: 24 })
  }
}

const setup_lights = async () => {
  if (localStorage.getItem('api_key')) {
    const url = `http://${localStorage.getItem('internalipaddress')}/api/${localStorage.getItem('api_key')}/lights/`
    const method = 'GET'
    const result = await get({ url, method })
    localStorage.setItem('lights', Object.keys(result))
  }
  return Promise.resolve()
}

const startLoading = () => {
  //TODO add nice css animations
}

const stopLoading = () => {
  //TODO remove nice css animations
  _lights().forEach(id => {
    setLights({ id, temperature: 0.2, color: 33000 })
  })
}

const legit_session = () => {
  const { internalipaddress, api_key, lights } = localStorage
  return internalipaddress && api_key && lights
}

const connect = async () => {
  if (errorActive) return
  legit_session()
    ? create_success()
    : await get_internal_ip()
  await get_hue_token()
  await setup_lights()
  legit_session() && create_success()
}


const drawBuffer = data => {
  if (!legit_session()) return
  let temperature = 0

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

  if (color < 1000 || color > 65535) {
    color = Math.floor(temperature * 65535)
  }

  _lights().forEach(id => {
    setLights({ id, temperature, color })
  })

  _color = color
  _temperature = temperature
}



const explosion_colors = ['#57a1ff', '#33629e', '#1c395e']
const bubbles = 25;

const explode = (x, y) => {
  let particles = [];
  let ratio = window.devicePixelRatio;
  let c = document.createElement('canvas');
  let ctx = c.getContext('2d');

  c.style.position = 'absolute';
  c.style.left = (x - 100) + 'px';
  c.style.top = (y - 100) + 'px';
  c.style.pointerEvents = 'none';
  c.style.width = 200 + 'px';
  c.style.height = 200 + 'px';
  c.style.zIndex = 100;
  c.width = 200 * ratio;
  c.height = 200 * ratio;
  document.body.appendChild(c);

  for (var i = 0; i < bubbles; i++) {
    particles.push({
      x: c.width / 2,
      y: c.height / 2,
      radius: r(20, 30),
      color: explosion_colors[Math.floor(Math.random() * explosion_colors.length)],
      rotation: r(0, 360, true),
      speed: r(8, 12),
      friction: 0.9,
      opacity: r(0, 0.5, true),
      yVel: 0,
      gravity: 0.1
    });
  }

  render(particles, ctx, c.width, c.height);
  setTimeout(() => document.body.removeChild(c), 1000);
}

const render = (particles, ctx, width, height) => {
  requestAnimationFrame(() => render(particles, ctx, width, height));
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p, i) => {
    p.x += p.speed * Math.cos(p.rotation * Math.PI / 180);
    p.y += p.speed * Math.sin(p.rotation * Math.PI / 180);

    p.opacity -= 0.01;
    p.speed *= p.friction;
    p.radius *= p.friction;
    p.yVel += p.gravity;
    p.y += p.yVel;

    if (p.opacity < 0 || p.radius < 0) return;

    ctx.beginPath();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  });

  return ctx;
}

const r = (a, b, c) => parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0));

let interval = setInterval(() => {
  let element = document.querySelector('#connectBtn')
  if (element) {
    element.addEventListener('click', e => explode(e.pageX, e.pageY));
    clearInterval(interval)
  }
}, 1000)


//Further develop this to make nice

// document.getElementById('connectBtn').addEventListener('mouseover', e => explode(e.pageX, e.pageY));
// function changeLights(data) {
//   const array1 = []
//   const array2 = []
//   const array3 = []

//   for (let i = 0; i < data.length; i++) {
//     if(i < 20) {
//       data[i].magnitude && array1.push(data[i].magnitude)
//     }

//     else if(i < 40) {
//       data[i].magnitude && array2.push(data[i].magnitude)
//     }

//     else if(i < 61) {
//       data[i].magnitude && array3.push(data[i].magnitude)
//     }
//   }

//   const sum = arr => arr.reduce((a, b) => a + b, 0)
//   const sum1 = sum(array1)
//   const sum2 = sum(array2)
//   const sum3 = sum(array3)

//   const { red, blue, green } = data.reduce((acc, cur) => {
//     acc[cur.color] ? acc[cur.color] = acc[cur.color] + cur.magnitude : acc[cur.color] = cur.magnitude
//     return acc
//   }, {})

//   const r = (red / 1600 * 255)
//   const b = (blue / 1600 * 255)
//   const g = (green / 1600 * 255)
//   const [h, s, l] = rgbToHsl({ r, g, b })
//   const color = Math.random() * 65535
//   const brightness = l/100

// }

// const rgbToHsl = ({ r, g, b }) => {
//   r /= 255, g /= 255, b /= 255;
//   var max = Math.max(r, g, b), min = Math.min(r, g, b);
//   var h, s, l = (max + min) / 2;

//   if (max == min) {
//     h = s = 0; // achromatic
//   } else {
//     var d = max - min;
//     s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//     switch (max) {
//       case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//       case g: h = (b - r) / d + 2; break;
//       case b: h = (r - g) / d + 4; break;
//     }
//     h /= 6;
//   }

//   return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
// }