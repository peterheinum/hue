const get = async ({ url, body, method }) => await fetch(url, { body: JSON.stringify(body), method }).then(res => res.json())

let lastColor = 0

const getLights = async ({ id, temperature }) => {
  const url = `http://192.168.1.99/api/aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh/lights/${id}/`
  const method = 'GET'
  const response = await get({ url, method })
}

const setLights = async ({ id, temperature, mirror }) => {
  
  if(temperature - lastColor > 0.05 || temperature - lastColor < -0.05) {
    console.log(lastColor, temperature)
    const url = `http://192.168.1.99/api/aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh/lights/${id}/state`
    
    const color = Math.floor(temperature * 65535)
    
    const body = mirror
    ?  { 'on': true, 'sat': 254, 'bri': Math.floor(200*temperature), "hue": color }
    : { 'on': true, 'sat': 254, 'bri': Math.floor(200*temperature), 'hue': color }
    const method = 'PUT'
    const response = await get({ url, body, method })
    lastColor = temperature
  }
}


function drawBuffer(width, height, context, data) {
  let temperature = 0;

  for(let i = 0; i < data.length; i++){
  if(temperature < data[i]) {
    temperature = data[i];
  }}
  // console.log(temperature)
  setLights({ id: 1, temperature })
  setLights({ id: 2, temperature, mirror: true })
}