let urls = { 
    "loginURL": "https://ignitiumwa.ignitiaschools.com/owsoo/j_spring_security_check",
    "coursesURL" : "https://ignitiumwa.ignitiaschools.com/owsoo/studentHome/coursesJson",
    "unitsURL": "https://ignitiumwa.ignitiaschools.com/owsoo/studentHome/unitsJson",  //id
    "assignmentsURL" : "https://ignitiumwa.ignitiaschools.com/owsoo/studentHome/assignmentsJson" //id
}

let creds = {
    "j_username": process.env.j_username,
    "j_password": process.env.j_password
}


module.exports = {
    urls,
    creds
}