const get = async ({ url, body, method }) => await fetch(url, { body: JSON.stringify(body), method }).then(res => res.json())

const getLights = async ({ id, temperature }) => {
  const url = `http://192.168.1.99/api/aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh/lights/${id}/`
  const method = 'GET'
  const response = await get({ url, method })
  console.log(response)
}

const setLights = async ({ id, temperature }) => {
  console.log('hi')
  const url = `http://192.168.1.99/api/aQhjtMtA9Cg76LpuGRb55WRMThjj-TLrvMdBTPzh/lights/${id}/state`

  const color = Math.floor((Math.random() * 65535)*temperature)
  console.log(color)
  const body = { 'on': true, 'sat': 254, 'bri': 104, 'hue': color }
  const method = 'PUT'
  const response = await get({ url, body, method })
  console.log(response)
}


function drawBuffer(width, height, context, data) {
  const temperature = Math.max(...data)
  setLights({ id: 1, temperature })
  setLights({ id: 2, temperature })
}