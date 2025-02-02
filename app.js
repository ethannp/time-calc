const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function onChange() {
    document.getElementById("saveBtn").hidden = false;
    document.getElementById("resultText").textContent = "";
    const startTime = document.getElementById("startTime").value.split(":").map(Number);
    const endTime = document.getElementById("endTime").value.split(":").map(Number);
    const diffMinsTotal = (endTime[0] * 60 + endTime[1]) - (startTime[0] * 60 + startTime[1]);
    const hours = Math.floor(diffMinsTotal / 60);
    const mins = diffMinsTotal % 60;
    if (!isValidTime()) {
        document.getElementById("diffResult").textContent = "Error";
        document.getElementById("payResult").textContent = "$";
        document.getElementById("infoPay").textContent = "";
        document.getElementById("patientResult").textContent = "$"
        document.getElementById("infoPatient").textContent = ""
        return;
    } else {
        document.getElementById("diffResult").textContent = `${hours}h ${mins}m`
    }
    localStorage.setItem("defaultStart", document.getElementById("startTime").value);
    localStorage.setItem("defaultEnd", document.getElementById("endTime").value);
    if (document.querySelector('input[name="calcType"]:checked').value == "default") {
        let pay = 0;
        if (hours == 0) {
            pay = (600).toFixed(2);
            document.getElementById("infoPay").textContent = "";
        } else {
            pay = (600 + (hours - 1) * 550 + 550 * (mins / 60)).toFixed(2);
            let str = `600${(hours > 1) ? " + " + (hours - 1) + "*550" : ""}${(mins > 0) ? " + (" + mins + "/60)*550" : ""}`
            if (str != "600") {
                document.getElementById("infoPay").textContent = str;
            } else {
                document.getElementById("infoPay").textContent = "";
            }
        }
        document.getElementById("payResult").textContent = "$" + pay;
    } else if (document.getElementById("cas1").checked) {
        document.getElementById("payResult").textContent = "$2200";
        document.getElementById("infoPay").textContent = "";
    } else {
        document.getElementById("payResult").textContent = "$3100";
        document.getElementById("infoPay").textContent = "";
    }
    let patient = 0;
    if (hours == 0) {
        patient = 0;
        document.getElementById("infoPatient").textContent = ""
    } else {
        patient = ((650 * (hours - 1)) + 650 * (mins / 60)).toFixed(2);
        let str = `${(hours > 1) ? (hours - 1) + "*650" : ""}${(hours > 1 & mins > 0 ? " + " : "")}${(mins > 0) ? " (" + mins + "/60)*650" : ""}`
        if (str != "650") {
            document.getElementById("infoPatient").textContent = str;
        } else {
            document.getElementById("infoPatient").textContent = "";
        }
    }

    document.getElementById("patientResult").textContent = `$${patient}`
}



function loadData(numMonths) {
    try {
        let defaultStart = localStorage.getItem("defaultStart");
        let defaultEnd = localStorage.getItem("defaultEnd");
        if (defaultStart == null) {
            localStorage.setItem("defaultStart", "11:00");

        }
        if (defaultEnd == null) {
            localStorage.setItem("defaultEnd", "15:00");
        }
        defaultStart = localStorage.getItem("defaultStart");
        defaultEnd = localStorage.getItem("defaultEnd");
        document.getElementById("startTime").value = defaultStart;
        document.getElementById("endTime").value = defaultEnd;

        const data = JSON.parse(localStorage.getItem("data"));
        if (data == null) {
            localStorage.setItem("data", JSON.stringify([]));
            return;
        }
        data.sort((a, b) => {
            if (a.year != b.year) {
                return b.year - a.year
            } else {
                return b.month - a.month
            }
        });
        if (numMonths == -1) {
            numMonths = Math.min(data.length, 2)
        } else if (numMonths == -2) {
            numMonths = data.length;
            document.getElementById("showMore").style.display = "none";
        }
        if (data.length > numMonths) {
            document.getElementById("showMore").style.display = "";
        }
        const ranges = document.getElementById("ranges");
        while (ranges.firstChild) {
            ranges.removeChild(ranges.firstChild);
        }
        for (let i = 0; i < numMonths; i++) {
            let range = data[i];
            let details = document.createElement("details");
            let summary = document.createElement("summary");
            summary.setAttribute('id', months[parseInt(range.month) - 1] + range.year)
            summary.textContent = months[parseInt(range.month) - 1] + " " + range.year;
            let total = document.createElement("p");
            let totalVal = 0;
            let table = document.createElement("table");
            table.innerHTML = `<col style="width: 15%"><col style="width: 25%"><col style="width: 20%"><col style="width: 25%"><col style="width: 15%">`
            let header = document.createElement("tr");
            header.innerHTML = "<th>Date</th><th>Name</th><th>Start - End</th><th class='small'>Time<br>AnesthesiaPay<div class='bar'></div>PatientBill</th><th>Delete</th>"
            table.appendChild(header);
            data[i].times.sort((a, b) => {
                return a.date - b.date
            })
            for (let j = 0; j < data[i].times.length; j++) {
                let timeInfo = data[i].times[j];
                let row = document.createElement("tr");
                const startTime = timeInfo.startTime.split(":").map(Number);
                const endTime = timeInfo.endTime.split(":").map(Number);
                const diffMinsTotal = (endTime[0] * 60 + endTime[1]) - (startTime[0] * 60 + startTime[1]);
                const hours = Math.floor(diffMinsTotal / 60);
                const mins = diffMinsTotal % 60;
                let pay = 0;
                let overridePay = timeInfo.overridePay;
                if (overridePay == undefined) {
                    if (hours == 0) {
                        pay = (600).toFixed(2);
                    } else {
                        pay = (600 + (hours - 1) * 550 + 550 * (mins / 60)).toFixed(2);
                    }
                    totalVal += parseFloat(pay);
                    pay = "$" + pay;
                } else {
                    totalVal += parseFloat(overridePay.replace(/[^0-9.]/, ""));
                    pay = "* " + overridePay;
                }

                let name = timeInfo.name;
                if (name == undefined) {
                    name = "";
                }
                let patient = 0;
                if (hours == 0) {
                    patient = 0;
                } else {
                    patient = (((hours - 1) * 650) + 650 * (mins / 60)).toFixed(2)
                }
                row.innerHTML = `<td>${data[i].month}/${timeInfo.date}</td><td>${name}</td><td>${timeInfo.startTime} - ${timeInfo.endTime}</td><td>${hours}h ${mins}m<br>${pay}<div class='bar'></div>$${patient}</td>`;
                const deleteRowBtn = document.createElement("td");
                deleteRowBtn.innerHTML = "X";
                deleteRowBtn.classList.add("deletebtn")
                deleteRowBtn.addEventListener("click", () => deleteRow(i, j));
                row.appendChild(deleteRowBtn);
                table.appendChild(row);
            }

            total.innerHTML = `Total Month Pay: <b>$${totalVal.toFixed(2)}</b>`
            details.appendChild(summary);
            details.appendChild(total);
            details.appendChild(table);
            ranges.appendChild(details);
        }
    } catch (e) {
        console.log(e)
    }
}

function save() {
    if (!isValidTime()) {
        document.getElementById("resultText").textContent = "Invalid times";
        document.getElementById("resultText").style.color = "red";
    }
    const data = JSON.parse(localStorage.getItem("data"));
    const dateEntered = document.getElementById("date").value.split("-");
    let found = -1;
    for (let i = 0; i < data.length; i++) {
        if (dateEntered[0] == data[i].year && dateEntered[1] == data[i].month) {
            found = i;
            break;
        }
    }
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const name = document.getElementById("name").value;
    if (found == -1) {
        let newMonth = {
            month: dateEntered[1],
            year: dateEntered[0],
            times: [{
                date: dateEntered[2],
                startTime: startTime,
                endTime: endTime,
                name: name,
            }]
        }
        if (!document.getElementById("default").checked) {
            newMonth.times[0].overridePay = document.getElementById("payResult").textContent;
        }
        data.push(newMonth);
        localStorage.setItem("data", JSON.stringify(data));
        loadData(Math.min(data.length, 2));
    } else {
        let newDate = {
            date: dateEntered[2],
            startTime: startTime,
            endTime: endTime,
            name: name,
        }
        if (!document.getElementById("default").checked) {
            newDate.overridePay = document.getElementById("payResult").textContent;
        }
        data[found].times.push(newDate);
        localStorage.setItem("data", JSON.stringify(data));
        loadData(Math.min(data.length, 2));
    }
    document.getElementById("resultText").textContent = "Time added!";
    document.getElementById("resultText").style.color = "green";
    document.getElementById("saveBtn").hidden = true;

}

function isValidTime() {
    const startTime = document.getElementById("startTime").value.split(":").map(Number);
    const endTime = document.getElementById("endTime").value.split(":").map(Number);
    const diffMinsTotal = (endTime[0] * 60 + endTime[1]) - (startTime[0] * 60 + startTime[1]);
    if (isNaN(diffMinsTotal) || diffMinsTotal < 0) {
        return false;
    }
    return true;
}

function deleteRow(i, j) {
    const data = JSON.parse(localStorage.getItem("data"));
    data.sort((a, b) => {
        if (a.year != b.year) {
            return b.year - a.year
        } else {
            return b.month - a.month
        }
    });
    data[i].times.sort((a, b) => {
        return a.date - b.date
    })
    if (confirm(`Would you like to delete data on ${months[parseInt(data[i].month) - 1]} ${parseInt(data[i].times[j].date)}?`)) {
        data[i].times.splice(j, 1);
        if (data[i].times.length == 0) {
            data.splice(i, 1);
        }
        localStorage.setItem("data", JSON.stringify(data));
        loadData(Math.min(data.length, 2));
    }
}

window.onload = (event) => {
    document.getElementById("date").valueAsDate = new Date();
    loadData(-1);
    onChange();
}

document.getElementById("showMore").addEventListener("click", event => {
    loadData(-2)
})

function exp() {
    let textarea = document.getElementById("impexp");
    textarea.value = en(localStorage.getItem("data"));
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textarea.value).then(function() {
        document.getElementById("info").innerHTML = "Copied to Clipboard!";
    }, function(err) {
        document.getElementById("info").innerHTML = "Please copy the text below.";
    })


}

function imp() {
    if (document.getElementById("impexp").value != "" && confirm("Warning: This will overwrite all of your currently saved data. Proceed?")) {
        localStorage.setItem("data", de(document.getElementById("impexp").value));
        window.location.reload();
    }
}

function en(c) {
    var x = 'charCodeAt',
        b, e = {},
        f = c.split(""),
        d = [],
        a = f[0],
        g = 256;
    for (b = 1; b < f.length; b++) c = f[b], null != e[a + c] ? a += c : (d.push(1 < a.length ? e[a] : a[x](0)), e[a + c] = g, g++, a = c);
    d.push(1 < a.length ? e[a] : a[x](0));
    for (b = 0; b < d.length; b++) d[b] = String.fromCharCode(d[b]);
    return d.join("")
}

function de(b) {
    var a, e = {},
        d = b.split(""),
        c = f = d[0],
        g = [c],
        h = o = 256;
    for (b = 1; b < d.length; b++) a = d[b].charCodeAt(0), a = h > a ? d[b] : e[a] ? e[a] : f + c, g.push(a), c = a.charAt(0), e[o] = f + c, o++, f = a;
    return g.join("")
}