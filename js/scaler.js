var slider = document.getElementById("thescaler");
var input = document.getElementById("slidervalue");
var html = document.getElementsByTagName("html")[0];
// var localStorage = Window.localStorage;

var origMin = 1;
var origMax = 100;
var newMin = 0.5;
var newMax = 1.0;

function scale(x) {
    return ((Number(x) - origMin) / (origMax - origMin)) * (newMax - newMin) + newMin;
}

function invscale(x) {
    return ((Number(x) - newMin) / (newMax - newMin)) * (origMax - origMin) + origMin;
}

function setScale(value) {
    html.style.removeProperty("transform");
    html.style.setProperty("transform", `scale(${Number(value)})`);
    html.style.setProperty("transform-origin", "top center");

    // html.style.removeProperty("margin-top");
    // html.style.setProperty("margin-top", `-${100 - 100 * Number(value)}vh`);
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}`))
        ?.split("=")[1];
}

function clearAllCookies() {
    var cookies = document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
            var cookieBase =
                encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) +
                "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" +
                d.join(".") +
                " ;path=";
            var p = location.pathname.split("/");
            document.cookie = cookieBase + "/";
            while (p.length > 0) {
                document.cookie = cookieBase + p.join("/");
                p.pop();
            }
            d.shift();
        }
    }
}

function setCookie(name, value) {
    var cookies = document.cookie.split("; ");
    if (cookies.length == 1 && cookies[0] == "") {
        cookies = [];
    }
    if (cookies.some((value3) => value3.startsWith(`${name}`))) {
        cookies = cookies.map((value2) => {
            if (value2.startsWith(`${name}`)) {
                var key_value = value2.split("=");
                key_value[1] = value;
                return key_value.reduce((p, c) => `${p}=${c}`);
            } else {
                return value;
            }
        });
    } else {
        cookies.push(`${name}=${value}`);
    }
    cookies.push("SameSite=none");
    cookies.push("Secure");
    cookies.push("path=/");
    cookies.push("expires=Fri, 31 Dec 9999 23:59:59 GMT;");
    clearAllCookies();
    document.cookie = cookies.reduce((p, c) => `${p}; ${c}`);
}

window.onload = function () {
    var scale = getCookie("window_scale");

    if (scale != null && scale != "") {
        document.getElementById("thescaler").value = invscale(scale).toFixed(2);
        document.getElementById("slidervalue").value = scale;
        setScale(scale);
    }
};

slider.oninput = function () {
    document.getElementById("slidervalue").value = scale(slider.value).toFixed(2);
    setScale(scale(slider.value));
    setCookie("window_scale", `${scale(slider.value).toFixed(2)}`);
};

input.oninput = function () {
    if (0.5 <= input.value && input.value <= 1.0) {
        document.getElementById("thescaler").value = invscale(input.value);
        setScale(input.value);
        setCookie("window_scale", `${input.value}`);
    }
};
