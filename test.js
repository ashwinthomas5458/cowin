const fetch = require("node-fetch");

const pin = "678683";
const date = "05-06-2021"

const check = async ()=>{
    pinWise();
    distWise(308, "Palakkad");
    distWise(303, "Thrissur");
}


const pinWise=async()=>{
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
    await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pin}&date=${date}`, requestOptions)
        .then(response => response.text())
        .then(result => sortItems(result, "PIN-Wise", pin))
        .catch(error => console.log('error', error));
}

const distWise=async(id, dist)=>{
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
    await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${id}&date=${date}`, requestOptions)
        .then(response => response.text())
        .then(result => sortItems(result, "DIST-Wise", dist))
        .catch(error => console.log('error', error));
}

const sortItems = async (result, type, dist)=>{
    let data = await JSON.parse(result);
    let temp = [];
    if(data.sessions){
        await data.sessions.forEach(element => {
            if(element.available_capacity_dose1)temp.push({loc: element.name, address: element.address, number: element.available_capacity_dose1, fee: element.fee, min_age_limit: element.min_age_limit, vaccine: element.vaccine})
        });
    }
    // console.log(data);
    console.log(type, dist, temp);
}

check();