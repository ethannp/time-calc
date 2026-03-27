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
        return;
    } else {
        document.getElementById("diffResult").textContent = `${hours}h ${mins}m`
    }
    localStorage.setItem("defaultStart", document.getElementById("startTime").value);
    localStorage.setItem("defaultEnd", document.getElementById("endTime").value);
    
    let scale = 100;
    
    if (document.getElementById("800hr").checked) {
        scale = 800

    }
    document.getElementById("payResult").textContent = "$" + (scale * (diffMinsTotal/60.0)).toFixed(2);
    document.getElementById("infoPay").textContent = `${(diffMinsTotal / 60.0).toFixed(2)} * ${scale}`;
}

function calcStats(timeInfo) {
    const startTime = timeInfo.startTime.split(":").map(Number);
    const endTime = timeInfo.endTime.split(":").map(Number);
    const diffMinsTotal = (endTime[0] * 60 + endTime[1]) - (startTime[0] * 60 + startTime[1]);
    
    const hours = Math.floor(diffMinsTotal / 60);
    const mins = diffMinsTotal % 60;
    
    // Use the scale saved in the object, default to 800 if not found
    const scale = timeInfo.scale || 800;
    const totalPayDecimal = (scale * (diffMinsTotal / 60.0));
    
    const name = timeInfo.name || "";
    const payDisplay = `${hours}h ${mins}m @ $${scale}<br><b>$${totalPayDecimal.toFixed(2)}</b>`;

    return [name, hours, mins, payDisplay, totalPayDecimal];
}

function downloadFile(i) {
    let allData = JSON.parse(localStorage.getItem("data-timecalc2"));
    // Sort logic to match loadData display
    allData.sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
    
    let monthData = allData[i];
    let fileName = `timecalc2_${monthData.month}_${monthData.year}.csv`;
    let csvContent = "data:text/csv;charset=utf-8,Date,Name,Start,End,Duration,Rate,Total Pay\n";
    let grandTotal = 0;

    monthData.times.forEach(timeInfo => {
        let [name, hours, mins, payDisplay, addToTotal] = calcStats(timeInfo);
        grandTotal += addToTotal;
        
        // Clean pay string for CSV (removing the $)
        let cleanPay = addToTotal.toFixed(2);
        csvContent += `${monthData.month}/${timeInfo.date},${name},${timeInfo.startTime},${timeInfo.endTime},${hours}h${mins}m,$${timeInfo.scale},${cleanPay}\n`
    });

    csvContent += `,,,,,,Total,$${grandTotal.toFixed(2)}`;
    
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        const data = JSON.parse(localStorage.getItem("data-timecalc2"));
        if (data == null) {
            localStorage.setItem("data-timecalc2", JSON.stringify([]));
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
            header.innerHTML = "<th>Date</th><th>Name</th><th>Start - End</th><th class='small'>Details</th><th>Del</th>";
            table.appendChild(header);
            data[i].times.sort((a, b) => {
                return a.date - b.date
            })
            for (let j = 0; j < data[i].times.length; j++) {
                let timeInfo = data[i].times[j];
                let row = document.createElement("tr");
                let [name, hours, mins, pay, addToTotal] = calcStats(timeInfo);
                totalVal += addToTotal;
                row.innerHTML = `<td>${data[i].month}/${timeInfo.date}</td><td>${name}</td><td>${timeInfo.startTime} - ${timeInfo.endTime}</td><td>${pay}</td>`;
                const deleteRowBtn = document.createElement("td");
                deleteRowBtn.innerHTML = "X";
                deleteRowBtn.classList.add("deletebtn")
                deleteRowBtn.addEventListener("click", () => deleteRow(i, j));
                row.appendChild(deleteRowBtn);
                table.appendChild(row);
            }

            total.innerHTML = `<p><input type="button" onclick="downloadFile(${i});" value="Download month"></p>Total Month Pay: <b>$${totalVal.toFixed(2)}</b>`
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
        return;
    }
    const data = JSON.parse(localStorage.getItem("data-timecalc2"));
    const dateEntered = document.getElementById("date").value.split("-");
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const name = document.getElementById("name").value;
    
    // Capture the current scale from the radio buttons
    const scale = document.getElementById("800hr").checked ? 800 : 100;

    const newEntry = {
        date: dateEntered[2],
        startTime: startTime,
        endTime: endTime,
        name: name,
        scale: scale // This replaces overridePay
    };

    let found = -1;
    for (let i = 0; i < data.length; i++) {
        if (dateEntered[0] == data[i].year && dateEntered[1] == data[i].month) {
            found = i;
            break;
        }
    }

    if (found == -1) {
        data.push({
            month: dateEntered[1],
            year: dateEntered[0],
            times: [newEntry]
        });
    } else {
        data[found].times.push(newEntry);
    }

    localStorage.setItem("data-timecalc2", JSON.stringify(data));
    loadData(Math.min(data.length, 2));

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
    const data = JSON.parse(localStorage.getItem("data-timecalc2"));
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
        localStorage.setItem("data-timecalc2", JSON.stringify(data));
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
    textarea.value = en(localStorage.getItem("data-timecalc2"));
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
        localStorage.setItem("data-timecalc2", de(document.getElementById("impexp").value));
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