function onChange() {
    const startTime = document.getElementById("startTime").value.split(":").map(Number);
    const endTime = document.getElementById("endTime").value.split(":").map(Number);
    const diffMinsTotal = (endTime[0]*60 + endTime[1]) - (startTime[0]*60 + startTime[1]);
    const hours = Math.floor(diffMinsTotal / 60);
    const mins = diffMinsTotal % 60;
    if (isNaN(diffMinsTotal)) {
        document.getElementById("diffResult").textContent = "Error"
        document.getElementById("payResult").textContent = `$`
        document.getElementById("infoPay").textContent = "";
        return;
    }
    if(diffMinsTotal < 0) {
        document.getElementById("diffResult").textContent = "Start time cannot be after end time."
        document.getElementById("payResult").textContent = `$`
        document.getElementById("infoPay").textContent = "";
        return;
    } else {
        document.getElementById("diffResult").textContent = `${hours}h ${mins}m`
    }
    let doRoundUp = (mins % 15) > 7;
    let pay = 0;
    if (hours == 0) {
        pay = 500 * ((Math.floor(mins / 15) + (doRoundUp ? 1 : 0)) / 4)
        document.getElementById("infoPay").textContent = "";
    } else {
        pay = 500 + (hours - 1) * 450 + 450 * ((Math.floor(mins / 15) + (doRoundUp ? 1 : 0)) / 4)
        document.getElementById("infoPay").textContent = `500 + ${(hours - 1)}*450${(mins > 7) ? " + " + ((Math.floor(mins / 15) + (doRoundUp ? 1 : 0)) / 4) + "*450" : ""}`
    }
    document.getElementById("payResult").textContent = `$${pay}`
}

window.onload = (event) => {
    onChange();
}