

//my loan predictor
let loanPredictorIncome = (investment, periodMonths, rate, wholeperiod) => {

    try {

        
        var loanAmount = (80 / 100) * investment


        return loanAmount

    } catch (error) {
        console.log(error)
    }
}


/*

  // income investment
  
  incomeInvestment = (rate, investment) => {
    
    try {
      
      var percent = ((rate / 100))
      
      
      this.rowOne = parseFloat(((this.investment) * (((1 + (((percent) / 365)))) ** (365 * 1))).toFixed(2))
      
      
      var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]  //   2022
      var yearTotal = 0
      
      months.forEach(el => {
        var total = parseFloat(((investment) * ((1 + (percent / 360)) ** el)).toFixed(2)) - investment
        yearTotal += total

      });
    
    
    } catch (error) {
      console.log(error)
    }

  
  }

  //growth investment
  growthInvestment = () => {
  
  }

*/



module.exports = { loanPredictorIncome }