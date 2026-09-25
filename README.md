# cowin

A single-page, framework-free web app for checking COVID-19 vaccine slot availability through the public CoWIN API (India).

## Overview

`index.html` (titled "Vaccinne Check") provides two search modes selected via tabs:

- **Search by PIN** – PIN code, dose type, date and age group.
- **Search by District** – state, district, dose type, date and age group.

`app.js` runs on window load and:

- populates the date selector with today plus the next nine days (`dd-mm-yyyy`);
- loads states and districts from `https://cdn-api.co-vin.in/api/v2/admin/location/...`;
- queries `appointment/sessions/public/findByPin` or `findByDistrict`, then filters and sorts the results by dose and age;
- repeats the search on an interval (`setInterval`) and offers an "Allow Notification" button that requests browser notification permission.

## Stack

Vanilla JavaScript, HTML, Bootstrap (`bootstrap.min.css`) and custom styles in `style.css`. There is no build step or package manifest.

## Running

Serve the directory with any static file server and open `index.html`. Requests are made directly from the browser to the CoWIN public API, so availability depends on that service and its CORS policy.

## Layout

```
index.html         Markup
app.js             Search, polling and notification logic
style.css          Custom styles
bootstrap.min.css  Bootstrap styles
images/            Static assets (e.g. loader)
```
