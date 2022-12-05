const db = require('../../db/index')
const dotenv = require('dotenv');
const { default: axios } = require('axios');
dotenv.config();
const headers = require('../modal/header')


let getJobs = (res) => {

    axios({
        method: 'get',
        url:  process.env.url + 'jobs',
        withCredentials: true,
        crossdomain: true,    
        headers: headers.headers()
    
    }).then(function (response) {
    
    res.json(response.data)
    //console.log(response)
    
    
    })
    .catch(function (error) {
        console.log(error)
    }); 
    

}


let runJob = (res , jobid ) => {
        
        console.log(jobid)
        
        axios({
        method: 'get',
        url:  process.env.url +'jobs/'+ jobid +'?command=executeJob',
        withCredentials: true,
        crossdomain: true,
        //data: $.param(reqData),    
        headers: headers.headers()
    
    }).then(function (response) {
    
    res.json(response.data)
    //console.log(response)
    
    
    })
    .catch(function (error) {
        console.log(error)
    }); 

}


module.exports = { getJobs , runJob }





