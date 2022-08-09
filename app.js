const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function onChange() {
    document.getElementById("saveBtn").hidden = false;
    const startTime = document.getElementById("startTime").value.split(":").map(Number);
    const endTime = document.getElementById("endTime").value.split(":").map(Number);
    const diffMinsTotal = (endTime[0] * 60 + endTime[1]) - (startTime[0] * 60 + startTime[1]);
    const hours = Math.floor(diffMinsTotal / 60);
    const mins = diffMinsTotal % 60;
    if (!isValidTime()) {
        document.getElementById("diffResult").textContent = "Error"
        document.getElementById("payResult").textContent = `$`
        document.getElementById("infoPay").textContent = "";
        return;
    } else {
        document.getElementById("diffResult").textContent = `${hours}h ${mins}m`
    }
    let pay = 0;
    if (hours == 0) {
        pay = (500).toFixed(2);
        document.getElementById("infoPay").textContent = "";
    } else {
        pay = (500 + (hours - 1) * 450 + 450 * (mins / 60)).toFixed(2);
        let str = `500${(hours > 1) ? " + " + (hours - 1) + "*450" : ""}${(mins > 0) ? " + (" + mins + "/60)*450" : ""}`
        if (str != "500") {
            document.getElementById("infoPay").textContent = str;
        } else {
            document.getElementById("infoPay").textContent = "";
        }
    }
    document.getElementById("payResult").textContent = `$${pay}`
}

function loadData() {
    try {
        const data = JSON.parse(localStorage.getItem("data"));
        if (data == null) {
            localStorage.setItem("data", JSON.stringify([]));
            return;
        }
        data.sort((a, b) => {
            if(a.year != b.year) { return b.year - a.year }
            else { return b.month - a.month }
        });
        const ranges = document.getElementById("ranges");
        while (ranges.firstChild) {
            ranges.removeChild(ranges.firstChild);
        }
        for (let i = 0; i < data.length; i++) {
            let range = data[i];
            let details = document.createElement("details");
            let summary = document.createElement("summary");
            summary.textContent = months[parseInt(range.month) - 1] + " " + range.year;
            let total = document.createElement("p");
            let totalVal = 0;
            let table = document.createElement("table");
            let header = document.createElement("tr");
            header.innerHTML = "<th>Date</th><th>Start - End</th><th>Time Diff</th><th>Pay</th><th>Delete</th>"
            table.appendChild(header);
            data[i].times.sort((a,b) => {return a.date - b.date})
            for (let j = 0; j < data[i].times.length; j++) {
                let timeInfo = data[i].times[j];
                let row = document.createElement("tr");
                const startTime = timeInfo.startTime.split(":").map(Number);
                const endTime = timeInfo.endTime.split(":").map(Number);
                const diffMinsTotal = (endTime[0] * 60 + endTime[1]) - (startTime[0] * 60 + startTime[1]);
                const hours = Math.floor(diffMinsTotal / 60);
                const mins = diffMinsTotal % 60;
                let pay = 0;
                if (hours == 0) {
                    pay = (500).toFixed(2);
                } else {
                    pay = (500 + (hours - 1) * 450 + 450 * (mins / 60)).toFixed(2);
                }
                totalVal += parseFloat(pay);
                row.innerHTML = `<td>${data[i].month}/${timeInfo.date}</td><td>${timeInfo.startTime} - ${timeInfo.endTime}</td><td>${hours}h ${mins}m</td><td>$${pay}</td>`;
                const deleteRowBtn = document.createElement("td");
                deleteRowBtn.innerHTML = "X"
                deleteRowBtn.style.color = "red"
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
    if (found == -1) {
        data.push({
            month: dateEntered[1],
            year: dateEntered[0],
            times: [{
                date: dateEntered[2],
                startTime: startTime,
                endTime: endTime,
            }]
        })
        localStorage.setItem("data", JSON.stringify(data));
        loadData();
    } else {
        data[found].times.push({
            date: dateEntered[2],
            startTime: startTime,
            endTime: endTime,
        });
        localStorage.setItem("data", JSON.stringify(data));
        loadData();
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
        if(a.year != b.year) { return b.year - a.year }
        else { return b.month - a.month }
    });
    data[i].times.sort((a,b) => {return a.date - b.date})
    if(confirm(`Would you like to delete data on ${months[parseInt(data[i].month) - 1]} ${parseInt(data[i].times[j].date)}?`)) {
        data[i].times.splice(j, 1);
        if (data[i].times.length == 0) {
            data.splice(i, 1);
        }
        localStorage.setItem("data", JSON.stringify(data));
        loadData();
    }
}

window.onload = (event) => {
    document.getElementById("date").valueAsDate = new Date();
    loadData();
    onChange();
}