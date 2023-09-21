



let calculator = (amount, percent) => {


    calculated = 0;

    try {

        calculated = ((percent / 100) * amount) + 40


    } catch (error) {
        console.log(error)
    }

    return calculated

}

let myDate = (date) => {

    console.log(date)

    let year = date.slice(0, 4)
    let month = date.slice(5, 7)
    let day = date.slice(8, 11)

    if (month === "01") {
        month = "January"
    } else if (month === "02") {
        month = "February"
    } else if (month === "03") {
        month = "March"
    } else if (month === "04") {
        month = "April"
    } else if (month === "05") {
        month = "May"
    } else if (month === "06") {
        month = "June"
    } else if (month === "07") {
        month = "July"
    } else if (month === "08") {
        month = "August"
    } else if (month === "09") {
        month = "September"
    } else if (month === "10") {
        month = "October"
    } else if (month === "11") {
        month = "November"
    } else if (month === "12") {
        month = "December"
    }

    date = day + " " + month + " " + year

    return date;
}

//reshedule date

let resheduleDate = (year, month, day) => {

    try {

        let rmonth, rday

        if (month < 10) {

            rmonth = "0" + month

        } else {
            rmonth = month
        }

        if (day < 10) {
            rday = "0" + day
        } else {
            rday = day
        }

        return year + "-" + rmonth + "-" + rday

    } catch (error) {
        console.log(error.message)
    }

}


module.exports = { calculator, myDate, resheduleDate }