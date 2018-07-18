function show() {
    var x = document.getElementById("myInput");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}


function validateForm() {
    var name = document.forms["form1"]["username"].value;
    var password = document.forms["form1"]["password"].value;
    if (name== ""||password=="") {
        alert("Values must be entered");
        return false;
    }
} 


