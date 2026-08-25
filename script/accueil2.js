
import { auth, db } from "./firebase.js";
import {creerCompteFirebase,connexionFirebase,creerProfil} from "./auth.js";

function start(){
    document.getElementById("creationCompte").style.display = "none";
    window.AffCrCompte = AffCrCompte;
    window.recupererNom = recupererNom;
    window.creerCompte = creerCompte;
    localStorage.removeItem("Comptes");

    console.log("Firebase connecté !");
    console.log(auth);
    console.log(db);
}
function AffCrCompte(){
    document.getElementById("ButtonCreer").style.display = "none";
    document.getElementById("creationCompte").style.display = "block";
    document.getElementById("SeCoo").style.display = "none";
}
async function recupererNom() { 
 
    const email = document.getElementById("email").value; 
    const mdp = document.getElementById("MDP").value; 
 
    const user = await connexionFirebase(email, mdp); 
 
    if (user === "CANLOAD_FALSE") {

        alert("Votre compte n'est pas encore autorisé.");

        return;
    }

    if (user) { 
 
        console.log("Bienvenue !"); 
         
        window.location.href = "../pages/pagePrinc.html"; 
 
    } 
    else { 
 
        alert("E-mail ou mot de passe incorrect."); 
 
    } 
}
async function creerCompte() {

    const email = document.getElementById("Nemail").value;
    const mdp = document.getElementById("NMDP").value;

    const nom = document.getElementById("Nnom").value;
    const metier = document.getElementById("métier").value;
    const argent = Number(document.getElementById("argent").value);

    const user = await creerCompteFirebase(email, mdp);

    if (!user) {
        alert("Impossible de créer le compte.");
        return;
    }

    const profilCréé = await creerProfil(user, {
        nom: nom,
        metier: metier,
        argent: argent
    });

    if (!profilCréé) {
        alert("Le compte a été créé, mais le profil n'a pas pu être enregistré.");
        return;
    }

    console.log("Compte + profil créés !");

    window.location.href = "../pages/pagePrinc.html";
}

document.addEventListener("DOMContentLoaded", () => {
    start();
});