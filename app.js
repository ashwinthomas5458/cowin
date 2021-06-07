window.addEventListener('load', () => {
    runAll();
})

function runAll() {
    let currentTab = 0;
    let dates = [];
    let states = [];
    let loopId = "";

    const allowNotification =()=>{
      const notificationBtn = document.querySelector('.c-notification-btn');

      notificationBtn.addEventListener('click', ()=>{
        if (("Notification" in window) && Notification.permission != "granted") {
          Notification.requestPermission();
        }
        else if(!("Notification" in window)){
          alert("Browser does not support notification");
        }
      })
    }

    const setDateItems = () => {
        const dateSelector = document.querySelector("#date-selector");
        const today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();
        let day = today.getDate();
        dates = [`${day > 9 ? day : `0${day}`}-${month < 12 ? month + 1 > 9 ? month + 1 : `0${month + 1}` : '01'}-${year}`];
        for (let i = 1; i < 10; i++) {
            const upcomingDay = new Date(today);
            upcomingDay.setDate(upcomingDay.getDate() + i);
            let year = upcomingDay.getFullYear();
            let month = upcomingDay.getMonth();
            let day = upcomingDay.getDate();
            dates.push(`${day > 9 ? day : `0${day}`}-${month < 12 ? month + 1 > 9 ? month + 1 : `0${month + 1}` : '01'}-${year}`);
        }

        dateSelector.innerHTML = `${dates.map((date, i) => (
            `<option value="${i}">${date}</option>`
        )).join("")}`
    }

    const getLocations = () => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states", requestOptions)
            .then(response => response.text())
            .then(result => {
                states = JSON.parse(result).states;
            })
            .catch(error => console.log('error', error));
    }

    const setLocations = () => {
        const statesSelector = document.querySelector("#state-selector");
        statesSelector.innerHTML = `<option selected>Select State</option>
                                ${states.map(state => (
            `<option value="${state.state_id}">${state.state_name}</option>`
        )).join("")}`

        statesSelector.addEventListener('change', (e) => {
            if (e.target.value) {
                getDistricts(e.target.value);
            }
        });
    }

    const getDistricts = (id) => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${id}`, requestOptions)
            .then(response => response.text())
            .then(result => {
                let districts = JSON.parse(result).districts;
                setDistricts(districts);
            })
            .catch(error => console.log('error', error));
    }

    const setDistricts = (districts) => {
        const districtsSelector = document.querySelector("#district-selector");
        districtsSelector.innerHTML = `<option selected>Select District</option>
                                ${districts.map(district => (
            `<option value="${district.district_id}">${district.district_name}</option>`
        )).join("")}`
    }

    const tabHeadings = document.querySelectorAll('.c-tabHeading');

    tabHeadings.forEach(tabHeading => {
        tabHeading.addEventListener('click', (e) => {
            let tab = e.target.dataset.tabValue;
            tabChange(Number(tab));
        })
    });

    const searchListener = () => {
        const searchButton = document.querySelector('.c-submit-btn');

        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            const dateSelector = document.querySelector("#date-selector");
            const dose = document.querySelector('#dose-type');
            const ageSelector = document.querySelector("#age-selector");
            const dataContainer = document.querySelector('.c-data-container');
            if (e.target.dataset.param === "pin") {
                const pin = document.querySelector('#pin-code');
                let date = dates[dateSelector.value];
                if (pin.value && pin.value > 99999) {
                  if (Notification.permission==="granted"){
                    loopId = setInterval(() => {
                      pinWise(pin.value, date, dose.value, ageSelector.value);
                    }, 15000);
                  }
                  else{
                    pinWise(pin.value, date, dose.value, ageSelector.value);
                  }
                    dataContainer.innerHTML = `<div class="col-lg-12 py-5 mt-3">
                <div class="container py-5 d-flex justify-content-center flex-column align-items-center">
                  <img class="c-loader" src="images/loader.gif" alt="loader">
                </div>
              </div>`
                };
            }
            else if (e.target.dataset.param === "district") {
                const districtsSelector = document.querySelector("#district-selector");
                let date = dates[dateSelector.value];
                if (districtsSelector.value) {
                  if (Notification.permission==="granted"){
                    loopId = setInterval(() => {
                      distWise(districtsSelector.value, date, dose.value, ageSelector.value);
                    }, 15000);;
                  }
                  else{
                    distWise(districtsSelector.value, date, dose.value, ageSelector.value);
                  }
                    dataContainer.innerHTML = `<div class="col-lg-12 py-5 mt-3">
                    <div class="container py-5 d-flex justify-content-center flex-column align-items-center">
                    <img class="c-loader" src="images/loader.gif" alt="loader">
                    </div>
                </div>`
                };
            }
        });
    }

    const pinWise = async (pin, date, dose, age) => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pin}&date=${date}`, requestOptions)
            .then(response => response.text())
            .then(result => sortItems(result, "PIN-Wise", dose, age))
            .catch(error => console.log('error', error));
    }

    const distWise = async (id, date, dose, age) => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${id}&date=${date}`, requestOptions)
            .then(response => response.text())
            .then(result => sortItems(result, "DIST-Wise", dose, age))
            .catch(error => console.log('error', error));
    }

    const sortItems = async (result, type, dose, age) => {
        let data = await JSON.parse(result);
        let results = [];
        if (data.sessions) {
            await data.sessions.forEach(element => {
                if(age){
                  if (element[`available_capacity_dose${dose}`] && ((element.min_age_limit==18 && age==18)||(age==45))) results.push({ loc: element.name, address: element.address, number: element.available_capacity_dose1, fee: element.fee, min_age_limit: element.min_age_limit, vaccine: element.vaccine })
                }
                else{
                  if (element[`available_capacity_dose${dose}`]) results.push({ loc: element.name, address: element.address, number: element.available_capacity_dose1, fee: element.fee, min_age_limit: element.min_age_limit, vaccine: element.vaccine })
                }
            });
        }
        const dataContainer = document.querySelector('.c-data-container');
        if (results.length) {
            dataContainer.innerHTML = `${results.map(result => (
                `<div class="col-xl-4 col-lg-6 col-md-6 col-12 py-2">
                    <div class="container c-displayWrap p-5">
                    <h3 class="fw-bold test-uppercase">${result.loc}</h3>
                    <p class="test-uppercase">${result.address}</p>
                    <p class="fw-bold test-uppercase">Doses left: <span class="ml-3 fw-light test-uppercase">${result.number}</span></p>
                    <p class="fw-bold test-uppercase">Fee: <span class="ml-3 fw-light test-uppercase">${result.fee}</span></p>
                    <p class="fw-bold test-uppercase">Min Age limit: <span class="ml-3 fw-light test-uppercase">${result.min_age_limit}</span></p>
                    <p class="fw-bold test-uppercase">Vaccine: <span class="ml-3 fw-light test-uppercase">${result.vaccine}</span></p>
                    </div>
                </div>`
            )).join("")}`;
            cowinRedirect();
            notify("Vaccination slot available", "Vaccination slot is available for the selected search options.");
            if(loopId) clearInterval(loopId);
        }
        else {
            dataContainer.innerHTML = `<div class="col-lg-12 py-5">
            <div class="container py-5 d-flex justify-content-center flex-column align-items-center">
              <img class="c-no-data" src="images/noData.svg" alt="No Data">
              <h6 class="fw-bold mt-3 text-muted">All slots full or no slots available in this location!</h6>
            </div>
          </div>`;
        }
    }

    const cowinRedirect = () => {
        const cards = document.querySelectorAll('.c-displayWrap');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = "https://selfregistration.cowin.gov.in/"
            })
        })
    }

    const notify=(title, body)=>{
      let options = {
        body: body
      }
      if (Notification.permission === "granted") {
        let notification = new Notification(title,options);
        // setTimeout(() => {
        //     notification.close();
        // }, 5000);
      }
    }

    function tabChange(tab) {
        if (currentTab != tab) {
            currentTab = tab;
            if(loopId) clearInterval(loopId);
            const tabWrapper = document.querySelector('.c-tab-content');
            tabHeadings[tab].classList.add('c-tabActive');
            if (tab === 0) {
                tabHeadings[1].classList.remove('c-tabActive');
                tabWrapper.innerHTML = `<form>
                <div class="row pt-5">
                  <div class="col-lg-6">
                    <div class="c-inputWrap position-relative overflow-hidden">
                      <input type="number" name="pin-code" placeholder="PIN Code" id="pin-code" required>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4 pt-lg-0">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="State" id="dose-type">
                        <option value="1">Dose 1</option>
                        <option value="2">Dose 2</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="State" id="date-selector">
                        <option value="1">Date</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="State" id="age-selector">
                        <option >Minimum age limit</option>
                        <option value="18">18</option>
                        <option value="45">45</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-12 pt-4 pt-lg-0">
                    <div class="d-flex container px-0 justify-content-end pt-3">
                      <div class="d-flex position-relative">
                        <button class="c-btn c-submit-btn" type="submit" data-param="pin">Search</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div class="container px-0 pt-5">
                <div class="row c-data-container">
                </div>
              </div>`
            }
            else {
                tabHeadings[0].classList.remove('c-tabActive');
                tabWrapper.innerHTML = `<form>
                <div class="row pt-5">
                  <div class="col-lg-6">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="State" id="state-selector">
                        <option selected>States</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4 pt-lg-0">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="District" id="district-selector">
                        <option selected>Select District</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="Dose" id="dose-type">
                        <option value="1">Dose 1</option>
                        <option value="2">Dose 2</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="date" id="date-selector">
                        <option value="1">Date</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4">
                    <div class="container px-0 overflow-hidden position-relative">
                      <select class="form-select c-select" aria-label="State" id="age-selector">
                        <option >Minimum age limit</option>
                        <option value="18">18</option>
                        <option value="45">45</option>
                      </select>
                      <span class="c-bottom-border position-absolute d-block"></span>
                    </div>
                  </div>
                  <div class="col-lg-6 pt-4 pt-lg-3">
                    <div class="d-flex container px-0 justify-content-end">
                      <div class="d-flex position-relative">
                        <button class="c-btn c-submit-btn" type="submit" data-param="district">Search</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div class="container px-0 pt-5">
                <div class="row c-data-container">
                </div>
              </div>`
              setLocations();
            }
            setDateItems();
            searchListener();
        }
        else {
            currentTab = tab;
        }
    }

    setDateItems();
    getLocations();
    searchListener();
    allowNotification();
}
