const express = require("express");
const router = express.Router();
const chargies = require('../modal/charge')
const calculator = require('../modal/calculator')
const chargeModal = require('../modal/charge')
const sms = require('../modal/sms')

var date_ob = new Date();

var day = ("0" + date_ob.getDate()).slice(-2);

var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

var year = date_ob.getFullYear();



var date = year + "-" + month + "-" + day;


var hours = date_ob.getHours();

var minutes = date_ob.getMinutes();

var seconds = date_ob.getSeconds();



var dateTime = year + "-" + month + "-" + day //+ " " + hours + ":" + minutes + ":" + seconds;


//run sms charge to client get data from database
router.post('/smscharge', (req, res) => {

  //get data from db

  // call function to send sms


  setInterval(() => {

    chargies.getmulaBalances().then((res) => {

      let data = res

      data.forEach((dt) => {
        let message = "Your account " + 'xxxxxx' + dt["accountNo"].slice(5) + " has been credited with SZL" + dt["balance"] + " on " + dateTime + ". Ref: " + dt["customerNo"]

          + " For queries call 24171975"

        sms.sendMessage(dt['customerNo'], message, res)

        //call function to update sent sms
        chargies.updateSent(dt["accountNo"])
      })
    })
  }, 10000);


})


// save mula balances
router.post('/mulabalances', (req, res) => {

  let data = req.body.data

  data.forEach((dt) => {

    chargies.saveMulaBalances(dt["accountNo"], dt["contactNo"], dt["balance"], dt["date"]).then((res) => {

      console.log(res)

    })
  })
})


//sms
router.post('/sms', (req, res) => {

  setInterval(() => {

    //checking if the are records in the database
    try {

      chargies.getsms().then(data => {

        if (data.length === 0) {
          console.log("ALL SMS CHARGE RUN")
          return;
        }


        data.forEach(el => {

          var amount = 0.95

          console.log(amount)
          console.log(el["accountNo"])

          chargies.createClientCharge(el["accountNo"], amount.toFixed(2), 13, calculator.myDate(el["date"])).then(dt => {

            let data = dt.data

            var resourceID = data["resourceId"]

            // will be used to pay the charge
            chargies.payCharge(el["accountNo"], resourceID, amount.toFixed(2), calculator.myDate(el["date"])).then((newData) => {

              //console.log(newData)   

              // call funtion to update database
              chargies.updatesms(el["accountNo"]).then(dat => {

                //paycharge function
                console.log("SMS CHARGE PAID")

              }).catch(err => {
                console.log(err)
              })

            }).catch(err => {
              console.log(err)
            })

          }).catch(err => {
            console.log(err)
          })
        })

      }).catch(err => {
        console.log(err)
      })

    } catch (error) {
      console.log(error)
    }

  }, 4000);

})


//run eft
router.post('/eft', (req, res) => {

  setInterval(() => {

    //checking if the are records in the database
    try {

      chargies.geteft().then(data => {

        if (data.length === 0) {
          console.log("ALL EFT FEES HAVE BEEN RUN")
          return;
        }


        data.forEach(el => {

          var amount = 10

          console.log(amount)
          console.log(el["accountNo"])

          chargies.createClientCharge(el["accountNo"], amount.toFixed(2), 10, calculator.myDate(el["date"])).then(dt => {

            let data = dt.data

            var resourceID = data["resourceId"]

            // will be used to pay the charge
            chargies.payCharge(el["accountNo"], resourceID, amount.toFixed(2), calculator.myDate(el["date"])).then((newData) => {

              //console.log(newData)   

              // call funtion to update database
              chargies.updategeteft(el["accountNo"]).then(dat => {

                //paycharge function
                console.log("EFT CHARGE PAID")

              }).catch(err => {
                console.log(err)
              })

            }).catch(err => {
              console.log(err)
            })

          }).catch(err => {
            console.log(err)
          })
        })

      }).catch(err => {
        console.log(err)
      })

    } catch (error) {
      console.log(error)
    }

  }, 6000);

})

//admin fee 
router.post("/mulaadminfees", (req, res) => {

  setInterval(() => {

    //checking if the are records in the database
    try {

      chargies.getadminfee().then(data => {

        if (data.length === 0) {
          console.log("ALL ADMIN FEES RUN")
          return;
        }


        data.forEach(el => {

          var amount = 18.00

          console.log(amount)
          console.log(el["accountNo"])

          chargies.createClientCharge(el["accountNo"], amount.toFixed(2), 12, calculator.myDate(el["date"])).then(dt => {

            let data = dt.data

            var resourceID = data["resourceId"]

            // will be used to pay the charge
            chargies.payCharge(el["accountNo"], resourceID, amount.toFixed(2), calculator.myDate(el["date"])).then((newData) => {

              //console.log(newData)   

              // call funtion to update database
              chargies.updategetadminfee(el["accountNo"]).then(dat => {

                //paycharge function
                console.log("Admin fees paid")

              }).catch(err => {
                console.log(err)
              })

            }).catch(err => {
              console.log(err)
            })

          }).catch(err => {
            console.log(err)
          })
        })

      }).catch(err => {
        console.log(err)
      })

    } catch (error) {
      console.log(error)
    }

  }, 6000);

})



//lets run withholding tax
router.post("/mulawithholdingtax", (req, res) => {

  setInterval(() => {

    //checking if the are records in the database
    try {

      chargies.getWithholdingTax().then(data => {

        if (data.length === 0) {
          console.log("ALL POSTINGS HAVE BEEN MADE")
          return;
        }


        data.forEach(el => {

          var amount = ((parseFloat(el["interest"])) * (0.1))

          console.log(amount)
          console.log(el["accountNo"])

          chargies.createClientCharge(el["accountNo"], amount.toFixed(2), 8, calculator.myDate(el["date"])).then(dt => {

            let data = dt.data

            var resourceID = data["resourceId"]

            // will be used to pay the charge
            chargies.payCharge(el["accountNo"], resourceID, amount.toFixed(2), calculator.myDate(el["date"])).then((newData) => {

              //console.log(newData)   

              // call funtion to update database
              chargies.updategetWithholdingTax(el["accountNo"]).then(dat => {

                //paycharge function
                console.log("Paid withholding tax")

              }).catch(err => {
                console.log(err)
              })

            }).catch(err => {
              console.log(err)
            })

          }).catch(err => {
            console.log(err)
          })
        })

      }).catch(err => {
        console.log(err)
      })

    } catch (error) {
      console.log(error)
    }

  }, 10000);

})


// store mula clients to database
router.post('/storemula', (req, res) => {

  //store mula accounts/
  console.log(req.body)
  let data = req.body.data

  data.forEach((el) => {

    chargies.storeMulaAccounts(el["accountNo"], el["interest"], el["date"]).then(data => {

      console.log(data)

    }).catch((err) => {
      console.log(err)
    })
  })
})


//create charge
router.get('/', async (req, res) => {

  chargies.savingsaccounts(res)
})

// upload charge muson

router.post('/savecharge', async (req, res) => {

  let result = await chargies.getChargeUploadMuson();

  var code;
  var type;
  var Description;

  if (result.length > 0) {
    result.forEach(el => {
      code = el.Code
      type = el.type
      Description = el.Description
    });
  }


  await chargies.updateSavedInMuson(code)

  /*
  if(myResult. affectedRows === 1){
      res.json("saved")
  }
  */

  // call function to save to musoni
  chargies.saveChargeMusoni(code, type, Description, res)
})

// upload a charge for a transaction

router.get('/savings', async (req, res) => {


  // list savings accounts
  chargies.listsavingsAccounts().then((data) => {
    //console.log(data)    
    //let value = JSON.parse(JSON.stringify(data.data))
    //res.json(value)

  }).catch((err) => {
    console.log(err)
  })

})

//save savings accounts of clients
router.post('/savesavings', async (req, res) => {

  //count help to count stored values
  countSaved = 0;

  let data = req.body.data

  data.forEach((el) => {

    chargies.saveSaving(el["clientID"], el["accountId"], el["clientID"], el["clientName"]).then((data) => {

      if (data.affectedRows === 1) {
        console.log("saved")
      } else {
        console.log("failed")
      }

    })

  })
})

// get saved savingsaccounts // transactions
router.get("/getsavings", async (req, res) => {


  // we have to get the last transaction type
  // call a function

  //impliment a start value
  let startTrans = 412;
  let endTrans = startTrans + 4;

  var mypromises = []
  var mydata = []

  // used to get clients
  chargies.getSavingsAccounts().then((data) => {

    //console.log(data)

    do {

      data.forEach(el => {


        startTrans = startTrans + 1;
        mypromises.push(

          // get all the transacttions

          chargies.transactions(el["accountNo"], startTrans).then((response) => {

            //update database set flag to false if checked for the day
            //el["accountNo"]
            chargies.updateWhenChecked()
            mydata.push(response.data)

          }).catch((error) => {
            //console.log(error)
          })
        )
      })

    } while (startTrans < endTrans);


    // call function to get all transactional ids if present

    Promise.all(mypromises).then(() => {
      //console.log(mydata)
      res.json(mydata)
    })
  });
})


// save client transactions
router.post('/clienttrans', async (req, res) => {

  let data = req.body;

  let myData = data.data

  myData.forEach(el => {
    let trans = el["transID"]
    let amount = el["amount"]
    let date = el["date"]
    let accountNo = el["accountNo"]

    chargies.saveClientsTransactions(trans, accountNo, amount, date).then((data) => {
      //console.log(data)
      //results of stored data
    })

  });

})

// craete a charge for a client
router.post("/createacccharge", async (req, res) => {

  //loop over this until all the 

  setInterval(() => {

    chargies.getTransToPayCharge().then((data) => {

      //console.log(data)
      data.forEach(el => {

        chargies.createClientCharge(el.accountNo, calculator.calculator(el.amount, 1.2)).then((data) => {
          //res.json(JSON.parse(JSON.stringify(data)))
          // console.log(data)
        })
      })

    })

  }, 2000);

  //create a charge on musoni
})

//create a savings chager ATM
router.post('/savingsatmcharge', async (req, res) => {
  
  let data = req.body
  
  // deposit charge and withdrawal
  await chargies.createClientCharge(data.accountNo, data.amount, 21, calculator.myDate(data.date)).then((data1) => {
    
    if (data1.data !== undefined) {
      
      let resourceid = data1.data["resourceId"]
      
      chargies.payCharge(data.accountNo, resourceid, data.amount, calculator.myDate(data.date)).then((payed) => {
        
        //console.log(payed)
      
      })
    }
  })

})



//get tranid and pay chargies
router.get("/getchargedetails", async (req, res) => {

  chargies.getSavingsAccounts().then((data) => {
    //console.log(data)
    
    data.forEach((dt) => {
      // call function to get all the charge details
      chargies.getChargeDetails(dt.accountNo).then((data1) => {

        let myData = data1.data
        myData.forEach(el => {


          //call function to save charge details
          chargies.saveChargePaymentDetails(el.id, el.chargeId, el.accountId, el.amount).then((data2) => {
            console.log("saved")
          })
        });
      })
    })
  })

})


//pay chargies
router.post('/paychargies', async (req, res) => {


  setTimeout(() => {
    chargies.getChargeToPay().then((data) => {

      // call function to pay chargies

      for (let el of data) {
        chargies.payCharge(el.accountId, el.id, el.amount).then((data) => {
          console.log(data)
        }).catch((error) => {
          console.log(error)
        })
      }
    })

  }, 6000);



})

//////////////////////////////////from another charge file////////////
//get charge range

router.post('/', async (req, res) => {


  console.log(req.body.data)

  let data = req.body.data;


  data.forEach(el => {
    chargeModal.chargeType(el.Code, el.type, el.Description);
  });

  /*
  let code = req.body.code;
  let desc = req.body.description;
  
  let result = await chargeModal.chargeType(code , desc);
  
  if(result.affectedRows ===1 ){
      res.json({"message":"saved"})
  }else {
      res.json({message : "failed"})
  }
  
  */
})

// save a fixed charge
router.post('/fixed', async (req, res) => {

  let code = req.body.code
  let amount = req.body.amount

  let result = await chargeModal.saveFixed(code, amount)

  if (result.affectedRows === 1) {
    res.json({ "message": "saved" })
  } else {
    res.json({ "message": "failed" })
  }

})

// get all chargies 
router.get('/chargies', async (req, res) => {

  let result = await chargeModal.getChargies();

  res.json(result)

})

// save range charge 
router.post('/range', async (req, res) => {

  //code percent minAmount maxAmount addedAmount primeValue VAT
  let b = req.body;
  let code = b.code
  let percent = b.percent
  let minAmount = b.minAmount
  let maxAmount = b.maxAmount
  let addedAmount = b.addedAmount
  let primeValue = b.primeValue
  let vat = b.vat
  let arrearsMonth = b.arrearsMonth

  let result = await chargeModal.saveRange(code, percent, minAmount, maxAmount, addedAmount, primeValue, vat, arrearsMonth)
  console.log(result)

  if (result.affectedRows === 1) {
    res.json({ "message": "saved" })
  } else {
    res.json({ "message": "failed" })
  }

})

//get charge range

router.get('/range', async (req, res) => {

  let result = await chargeModal.getChargeRange()

  res.json(result)

})

// delete a charge
router.delete('/', async (req, res) => {

  let result = await chargeModal.deleteCharge(req.query.code)

  if (result.affectedRows === 1) {
    res.json({ message: "deleted" })
  } else {
    res.json({ message: "failed" })
  }

})

//save charge in musoni
router.post("/saveloancharge", async (req, res) => {

  let data = req.body.data

  data.forEach((el) => {

    chargies.saveLoanClientCharge(el["accountNo"], el["id"], el["amount"]).then((data) => {
      //res.json(data.data)

      //save loan charge dtails to the database
      chargies.saveClientLoancharge(el["accountNo"], el["id"], el["amount"]).then((data) => {
        console.log("saved")
      })

    })

  })
})

// payloan charge
router.post("/payloancharge", (req, res) => {

  // no need for this methods since charges are paid automatically

  /*
  // get and pay charge
  chargies.getLoanDetailsPayments().then(data => {

    data.forEach(dt => {

      chargies.payMusoniLoanChargies(dt["accountNo"], dt["chargeId"]).then((data) => {
        console.log(data)
      }).catch((error) => {
        
        console.log(error.data)

      })

    })

  })
*/
})

router.post('/savepayloancharge', (req, res) => {

  let data = req.body.data

  var countSaved = 0;


  let savedLoansPenalties = (res, all) => {

    if (all === "all") {
      res.json({ message: "Loan Penalties Applied" })
    }
    if (all === "some") {
      res.json({ message: "Some Loan Penalties Have Been Paid" })
    }
  }

  //console.log(data.length)

  try {


    data.forEach(el => {

      chargies.saveLoanClientCharge(el["accountNo"], 6, el["Amount"], calculator.myDate(el["date"])).then(data1 => {
        //save data of all the saved detai
        try {
          if (data1 === undefined) {
            //do nothing an error occured
          } else {
            countSaved++
          }

          if (countSaved === data.length) {
            savedLoansPenalties(res, all = "all")
          }

          //if some of the data has been paid
          if ((data.length / 2) > countSaved) {
            savedLoansPenalties(res, all = "some")
          }
        } catch (err) {
          //console.log(err)
        }
      }).catch(err => {
        //console.log(err)
      })
    });
  } catch (error) {
    //console.log(error)
  }
})


// delete charge details from database
router.post('/chargedetails', async (req, res) => {

  chargies.deleteChargeDetails(req.body.code).then(data => {

    if (data.affectedRows === 1) {

      res.json({ message: "deleted" })
    }

  }).catch(err => {
    console.log(err)
  })

})

//save mpp accounts in database
router.post('/mpp', (req, res) => {

  //call function to save mpp
  chargies.storeMppAccount(req.body.accountNo, req.body.date, req.body.amount, req.body.rate).then(data => {

    if (data.affectedRows === 1) {
      res.json({ message: "saved" })
    }

    if (data.affectedRows === 0) {
      res.json({ message: "failed" })
    }

  })

})

//get mpp accounts
router.get('/mpp', (req, res) => {

  chargies.getmppAccount().then((data) => {
    res.json(data)
  })
})

// run mpp chargies
router.post('/runmppcharge', (req, res) => {

  //get account from database to run mmp charge where the charge was not run this month
  // get todays date

  let date = req.body.date

  chargies.getUnRunmpp(date).then(data => {

    // now store in muson
    let runData = data

    let size = data.length

    var sizeSaved = 0

    runData.forEach((el) => {

      // call function to create an mpp charge in musoni

      //let amount = parseFloat(el["amount"]) * parseFloat((el["rate"] / 1000))

      let amount = ((el["amount"] * ((7.372 / 1000))) / 9)

      console.log(amount)

      //12 is mpp charge from musoni
      chargies.saveLoanClientCharge(el["accountNo"], 12, amount, calculator.myDate(date)).then(data => {

        let data1 = data.data

        if (data1 !== undefined) {

          // call function to save after a succesfull run
          chargies.storeRanmpp(el["accountNo"], date).then(data => {

            if (data.affectedRows === 1) {
              sizeSaved += 1
            }

            if (sizeSaved === size) {
              res.json({ message: "saved" })
            }

          })
        }
      })
    })
  })
})

//get all admi laon accounts from database
router.get('/adminfee', async (req, res) => {

  chargies.getMonthlyLoanAccounts().then(data => {

    res.json(data)

  })

})

//save admin monthly fee  //loans admin feee
router.post('/adminfee', async (req, res) => {

  // insert accounts that needs to run monthly fee
  chargies.monthlyLoanFee(req.body.accountNo, req.body.date).then((data) => {

    if (data.affectedRows === 1) {
      res.json({ message: "Data saved" })
    } else {
      res.json({ message: "failed" })
    }

  })

})


// run each month addmin fee for each loan
router.post('/runloanadminfees', async (req, res) => {

  try {


    setInterval(() => {

      //run and pay all loans for this current month
      chargies.getUnRunMonthlyAdmin().then(data => {
        //store data
        var mydata = data

        if (data.length === 0) {
          console.log("DONE")
        }

        mydata.forEach(dt => {

          // MONTHLY ADMIN FEES WILL HAVE ITS OWN UNIQUE VALUE ID
          chargies.saveLoanClientCharge(dt["accountNo"], 3, 50, calculator.myDate(dt["date"])).then(data => {

            //pay the loan charge
            if (data.data !== undefined) {

              // update when charge has been updated
              chargies.updateSavedAdminFee(dt["accountNo"]).then(found => {

                console.log(found)

              })
            }
          })
        })
      })
    }, 10000);

  } catch (error) {
    console.log(error)
  }
})


module.exports = router;