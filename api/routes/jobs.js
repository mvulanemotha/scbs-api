const express = require("express");
const router = express.Router();
const jobs = require('../modal/jobs')

// get lits of jobs
router.get('/' , async(req , res) => {

   jobs.getJobs(res);

})


// run a job
router.post('/' , async(req , res) => {
    

    //console.log(req.body)
    jobs.runJob(res , req.body.jobid)

})

module.exports = router