const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();


let tellerHeaders = (username, password) => {
  
  //let apiKey = 'uUUnYBrEJ48mp2JoM8Jni7yIf8JDRP1N7mZvUTmO'
  //let apiKey = 'G1ApOPzYok3CnSupBeBMfRMXEFxHVMT5DaFc5854'
  // demo api key
  let apiKey = process.env.key;
  let musonCredentials = username + ':' + password
  
  let buff = new Buffer.from(musonCredentials)
  
  let base64Credentials = buff.toString('base64');
  
  let authHeader = 'Basic ' + base64Credentials
  
  //let token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
  
  return header = {
    //'Authorization': 'Basic U0NCUzAwMTA6TXZ1bGFuZTJAQA==',//`Basic ${token}`,
    //'User-Agent': 'PostmanRuntime/7.29.2',
    'Authorization': authHeader,
    'X-Fineract-Platform-TenantId': 'StatusCapital',
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'keep-alive': true
    //'Accept-Encoding' : 'gzip, deflate, br'
  }

}

let headers = () => {
  
  /*
  
User1 = 'Status Capital API'
Password1 = 'Status12345'
  */
  
  //let apiKey = 'uUUnYBrEJ48mp2JoM8Jni7yIf8JDRP1N7mZvUTmO' //process.env.key;
  let apiKey = process.env.key;
  let username = 'Status Capital API' //process.env.User
  let password = 'Status12345' //process.env.password
   
  
  
  let musonCredentials = username + ':' + password
  
  let buff = new Buffer.from(musonCredentials)
  
  let base64Credentials = buff.toString('base64');
  
  let authHeader = 'Basic ' + base64Credentials
  
  //let token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
  
  return header = {
    //'Authorization': 'Basic U0NCUzAwMTA6TXZ1bGFuZTJAQA==',//`Basic ${token}`,
    //'User-Agent': 'PostmanRuntime/7.29.2',
    'Authorization': authHeader,
    'X-Fineract-Platform-TenantId': 'StatusCapital',
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'keep-alive': true
    //'Accept-Encoding' : 'gzip, deflate, br'
  }

}

module.exports = { headers, tellerHeaders }