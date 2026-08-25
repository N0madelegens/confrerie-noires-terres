import { CurrentCompte,ValT,AddTransaction,SwArgT,AddF,DellF,MakeQ,AddQ,ValQ,SetCurrentCompte,chargerQuetes,chargerComptes,chargerForum,chargerTransactions,ValiderTransaction,ChargerInfo,ModifierInfo} from "./donnee.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { auth } from "./firebase.js";

import { recupererProfil } from "./auth.js";

async function start(){
    window.allerForum = allerForum;
    window.allerGuildes = allerGuildes;
    window.allerTransactions = allerTransactions;
    window.allerQuêtes = allerQuêtes;
    window.autoResize = autoResize;
    window.ModifInfo = ModifInfo;
    window.ValidModifInfo = ValidModifInfo;
    window.ValidTransact = ValidTransact;
    window.AddT = AddT;
    window.ValidT = ValidT;
    window.AddMsg = AddMsg;
    window.AddQu=AddQu;
    window.ValidQu=ValidQu;
    window.makeQu=makeQu;
    window.SupprMsg=SupprMsg;

    const quetesFirebase = await chargerQuetes();
    console.log("mes quêtes:"+quetesFirebase);

    const info = await ChargerInfo();

    document.getElementById("contenuInfo").textContent = info;

    document.getElementById("modifInfo").style.display = "none";
    document.getElementById("addT").style.display = "none";

    //localStorage.removeItem("Comptes");
    //localStorage.removeItem("Forum");
    //localStorage.removeItem("Transactions");
    //localStorage.removeItem("quêtes");
    //localStorage.removeItem("CurentCompte");

    InitList();
    ReLoadCC();
    if(CurrentCompte.métier!="banquier"){
        document.getElementById("ifBanquier").style.display = "none";
    }
}

function ReLoadCC(){
    if(CurrentCompte.modo==="oui"){
        document.getElementById("currentCompte").textContent = "MODO "+CurrentCompte.name+" "+CurrentCompte.métier+" argent:"+CurrentCompte.argent+"       grade:"+CurrentCompte.grade;

    }
    else{
        document.getElementById("currentCompte").textContent = CurrentCompte.name+" "+CurrentCompte.métier+" argent:"+CurrentCompte.argent+"       grade:"+CurrentCompte.grade;
        document.getElementById("ifMODO").style.display = "none";
        document.getElementById("ifModo").style.display="none";
    }
}
//déplacement dans page
function allerForum() {
    document.getElementById("forum").scrollIntoView({
        behavior: "smooth"
    });
}
function allerGuildes() {
    document.getElementById("guildes").scrollIntoView({
        behavior: "smooth"
    });
}
function allerTransactions() {
    document.getElementById("transactions").scrollIntoView({
        behavior: "smooth"
    });
}
function allerQuêtes() {
    document.getElementById("quêtes").scrollIntoView({
        behavior: "smooth"
    });
}
//quêtes
async function AddQu(){
    const cont=document.getElementById("descNQ").value;
    AddQ(CurrentCompte.name,cont);
    InitList();
}
async function ValidQu(){

    const pos = Number(document.getElementById("numVQ").value);

    const quetesFirebase = await chargerQuetes();

    let compteur = 0;

    for (let q of quetesFirebase) {

        if (q.proprietaire === CurrentCompte.uid) {

            if (compteur === pos) {

                await ValQ(q.id);

                break;
            }

            compteur++;
        }
    }

    await InitList();
}
async function makeQu(){

    const pos = Number(document.getElementById("numMQ").value);

    const quetesFirebase = await chargerQuetes();

    let compteur = 0;

    for (let q of quetesFirebase) {

        if (q.fait === "non") {

            if (compteur === pos) {

                await MakeQ(CurrentCompte.name, q.id);

                break;
            }

            compteur++;
        }
    }

    await InitList();
}
//info
function ModifInfo(){
    document.getElementById("modifInfo").style.display = "block";
    autoResize(document.getElementById("modifInfo"));
    document.getElementById("Info").value = document.getElementById("contenuInfo").textContent;
}
async function ValidModifInfo(){

    const contenu =
        document.getElementById("Info").value;

    await ModifierInfo(contenu);

    document.getElementById("contenuInfo").textContent = contenu;

    document.getElementById("modifInfo").style.display = "none";
}

//transact
async function ValidTransact() {

    const pos = Number(document.getElementById("numT").value);

    const lignes = document.querySelectorAll(".ligneTrans");

    if (pos < 0 || pos >= lignes.length) {
        console.log("Numéro de transaction invalide");
        return;
    }

    const id = lignes[pos].dataset.id;

    await ValiderTransaction(id);

    await InitList();
}
async function AddT(){

    document.getElementById("addT").style.display = "block";

    const selectD = document.getElementById("dest");
    const selectE = document.getElementById("exp");

    // On vide les anciennes options
    selectD.innerHTML = "";
    selectE.innerHTML = "";

    const comptesFirebase = await chargerComptes();

    for (let c of comptesFirebase) {

        const optionD = document.createElement("option");
        optionD.value = c.name;
        optionD.textContent = c.name;

        const optionE = document.createElement("option");
        optionE.value = c.name;
        optionE.textContent = c.name;

        selectD.appendChild(optionD);
        selectE.appendChild(optionE);
    }

    // La banque
    const optionD = document.createElement("option");
    optionD.value = "banque";
    optionD.textContent = "banque";

    const optionE = document.createElement("option");
    optionE.value = "banque";
    optionE.textContent = "banque";

    selectD.appendChild(optionD);
    selectE.appendChild(optionE);
}
async function ValidT(){

    const dest = document.getElementById("dest");
    const exp = document.getElementById("exp");
    const arg = document.getElementById("argent");
    const expl = document.getElementById("expl");

    await AddTransaction({
        argent: arg.value,
        obj: expl.value,
        exp: exp.value,
        dest: dest.value
    });

    await InitList();

    document.getElementById("addT").style.display = "none";
}
//forum
async function AddMsg(){
    const date = new Date();
    const heure= date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const jour= date.getDate();
    const dateTexte = `${heure}:${minute} - ${jour}`;
    const msg=document.getElementById("MessF");
    AddF({exp:CurrentCompte.name,cont:msg.value,date:dateTexte});
    InitList();
}
async function SupprMsg(){

    const pos = Number(document.getElementById("num").value);

    const forumFirebase = await chargerForum();

    if (pos < 0 || pos >= forumFirebase.length) {
        console.log("Numéro de message invalide");
        return;
    }

    const message = forumFirebase[pos];

    await DellF(message.id);

    await InitList();
}
//donnné
async function InitList(){
    const affichage = document.getElementById("listeComptes");
    const transact = document.getElementById("transact");
    const forum=document.getElementById("zoneF");
    const Vquêtes=document.getElementById("quêtesV");
    const quêtes=document.getElementById("Quêtes");

    affichage.innerHTML = "";
    transact.innerHTML = "";
    forum.innerHTML="";
    Vquêtes.innerHTML="";
    quêtes.innerHTML="";
    const quetesFirebase = await chargerQuetes();
    const comptesFirebase = await chargerComptes();

    let d = 0;

    for (let q of quetesFirebase) {

    if (q.proprietaire === CurrentCompte.uid) {

        const ligne = document.createElement("div");

        ligne.classList.add("Yquetes");

        ligne.innerHTML =
            `<span>${d}| </span>
             <span>${q.desc}</span>
             <span>fait : ${q.fait}</span>`;

        d++;

        Vquêtes.appendChild(ligne);
    }
    }
    let c = 0;
    //let idsQuetes = [];
    for (let q of quetesFirebase) {

    if (q.fait === "non") {

        //idsQuetes.push(q.id);
        const ligne = document.createElement("div");
        ligne.dataset.id = q.id;

        ligne.classList.add("quetes");

        ligne.innerHTML =
            `<span>${c}| </span>
             <span>${q.name} </span>
             <span>${q.desc}</span>`;

        c++;

        quêtes.appendChild(ligne);
    }
    }
    for (let compte of comptesFirebase) {
        const ligne = document.createElement("div");
        ligne.classList.add("ligneCompte");
        if(compte.modo==="oui"){
            ligne.innerHTML = `<span>${"MODO"}</span><span>${compte.name}</span><span>${compte.métier}</span><span>${compte.grade}</span><span>${"argent:"+compte.argent}</span>`;
        }
        else{
            ligne.innerHTML = `<span>${compte.name}</span><span>${compte.métier}</span><span>${compte.grade}</span><span>${"argent:"+compte.argent}</span>`;

        }
        affichage.appendChild(ligne);
    }
    let b=0;
    const forumFirebase = await chargerForum();

    for (let msg of forumFirebase) {

    const ligne = document.createElement("div");

    ligne.classList.add("Conv");

    ligne.dataset.id = msg.id;

    ligne.innerHTML =
        `<span>${b}| </span>
         <span>${msg.exp}</span>
         <span>${msg.cont}</span>
         <span>${msg.date}</span>`;

    b++;

    forum.appendChild(ligne);
    }

    const transactionsFirebase = await chargerTransactions();

    let a = 0;

    if (transactionsFirebase.length === 0) {

    transact.innerHTML =
        "Pas de transactions non encore vérifiées";

    } else {

    for (let t of transactionsFirebase) {

        const ligne = document.createElement("div");

        ligne.classList.add("ligneTrans");

        ligne.dataset.id = t.id;

        ligne.innerHTML =
            `<span>${a}| </span>
             <span>${t.obj}</span>
             <span>${t.argent}</span>
             <span>vendeur:${t.exp}</span>
             <span>acheteur:${t.dest}</span>`;

        a++;

        transact.appendChild(ligne);
    }
    }
}

//formatage de texte
function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

document.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            console.log("Personne n'est connecté.");

            window.location.href = "accueil2.html";
            return;

        }

        console.log("Utilisateur Firebase :", user.uid);

        const profil = await recupererProfil(user);

        if (!profil) {

            console.error("Impossible de récupérer le profil.");
            return;

        }
        profil.uid = user.uid;

        SetCurrentCompte(profil);

        console.log("CurrentCompte :", CurrentCompte);

        start();

    });

});