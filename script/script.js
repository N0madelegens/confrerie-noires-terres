let check;
function start() {
    console.log("Initialisation");
    alert("Bonjour Chevalier !");
    check=document.getElementById("coo");
}
function Coo(){
    if(check.checked){
        location.href = "../pages/forum.html";
    }
    else{
        alert("veuillez souscrire au condition");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    start();
});