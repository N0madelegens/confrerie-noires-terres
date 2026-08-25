import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import { db, auth } from "./firebase.js";

export let CurrentCompte=[];
export let Transactions=[];
const sauvegardeCC = localStorage.getItem("CurrentCompte");
const sauvegardeT = localStorage.getItem("Transactions");

export async function ChargerInfo() {

    try {

        const infoRef = doc(db, "siteInfo", "general");
        const infoSnap = await getDoc(infoRef);

        if (infoSnap.exists()) {
            return infoSnap.data().contenu;
        }

        return "";

    } catch (erreur) {

        console.error("Erreur récupération info :", erreur);
        return "";

    }
}

export async function ModifierInfo(contenu) {

    try {

        const infoRef = doc(db, "siteInfo", "general");

        await setDoc(infoRef, {
            contenu: contenu
        });

        console.log("Info modifiée !");

    } catch (erreur) {

        console.error("Erreur modification info :", erreur);

    }
}

export async function ValiderTransaction(id) {

    try {

        // Récupération de la transaction
        const transactionRef = doc(db, "transactions", id);
        const transactionSnap = await getDoc(transactionRef);

        if (!transactionSnap.exists()) {
            console.log("Transaction introuvable");
            return;
        }

        const t = transactionSnap.data();

        const montant = Number(t.argent);

        if (montant <= 0) {
            console.log("Montant invalide");
            return;
        }

        console.log("Transaction à valider :", t);


        // =========================
        // Récupération du vendeur
        // =========================

        let vendeurSnap = null;

        if (t.exp !== "banque") {

            const qVendeur = query(
                collection(db, "users"),
                where("name", "==", t.exp)
            );

            const resultatVendeur = await getDocs(qVendeur);

            if (resultatVendeur.empty) {
                console.log("Vendeur introuvable :", t.exp);
                return;
            }

            vendeurSnap = resultatVendeur.docs[0];
        }


        // =========================
        // Récupération de l'acheteur
        // =========================

        let acheteurSnap = null;

        if (t.dest !== "banque") {

            const qAcheteur = query(
                collection(db, "users"),
                where("name", "==", t.dest)
            );

            const resultatAcheteur = await getDocs(qAcheteur);

            if (resultatAcheteur.empty) {
                console.log("Acheteur introuvable :", t.dest);
                return;
            }

            acheteurSnap = resultatAcheteur.docs[0];
        }


        // =========================
        // Vérification de l'argent
        // =========================

        if (acheteurSnap) {

            const argentAcheteur =
                Number(acheteurSnap.data().argent);

            if (argentAcheteur < montant) {

                console.log(
                    "L'acheteur n'a pas assez d'argent."
                );

                return;
            }
        }


        // =========================
        // Modification atomique
        // =========================

        const batch = writeBatch(db);


        // Le vendeur reçoit l'argent
        if (vendeurSnap) {

            const argentVendeur =
                Number(vendeurSnap.data().argent);

            batch.update(
                vendeurSnap.ref,
                {
                    argent: argentVendeur + montant
                }
            );
        }


        // L'acheteur paie
        if (acheteurSnap) {

            const argentAcheteur =
                Number(acheteurSnap.data().argent);

            batch.update(
                acheteurSnap.ref,
                {
                    argent: argentAcheteur - montant
                }
            );
        }


        // Suppression de la transaction
        batch.delete(transactionRef);


        // Tout est envoyé ensemble
        await batch.commit();


        console.log("Transaction validée !");

    } catch (erreur) {

        console.error(
            "Erreur validation transaction :",
            erreur
        );
    }
}

export async function chargerTransactions() {

    try {

        const resultat = await getDocs(
            collection(db, "transactions")
        );

        const transactions = [];

        resultat.forEach((document) => {

            transactions.push({
                id: document.id,
                ...document.data()
            });

        });

        transactions.sort((a, b) => a.timestamp - b.timestamp);

        return transactions;

    } catch (erreur) {

        console.error("Erreur récupération transactions :", erreur);

        return [];
    }
}

export async function chargerComptes() {

    try {

        const resultat = await getDocs(collection(db, "users"));

        const comptes = [];

        resultat.forEach((document) => {

            comptes.push({
                id: document.id,
                ...document.data()
            });

        });

        return comptes;

    } catch (erreur) {

        console.error("Erreur récupération comptes :", erreur);

        return [];
    }
}

export async function chargerForum() {

    try {

        const resultat = await getDocs(collection(db, "forum"));

        const messages = [];

        resultat.forEach((document) => {

            messages.push({
                id: document.id,
                ...document.data()
            });

        });

        messages.sort((a, b) => a.timestamp - b.timestamp);
        return messages;

    } catch (erreur) {

        console.error("Erreur récupération forum :", erreur);

        return [];
    }
}
export async function chargerQuetes() {

    const resultat = await getDocs(collection(db, "quetes"));

    const quetes = [];

    resultat.forEach((doc) => {

        quetes.push({
            id: doc.id,
            ...doc.data()
        });

    });

    console.log("Quêtes Firebase :", quetes);

    return quetes;
}
export function SetCurrentCompte(compte) {

    CurrentCompte = compte;

}

export async function AddQ(name, content) {

    try {

        await addDoc(collection(db, "quetes"), {
            name: name,
            desc: content,
            fait: "non",
            proprietaire: CurrentCompte.uid
        });

        console.log("Quête ajoutée !");

    } catch (erreur) {

        console.error("Erreur ajout quête :", erreur);

    }
}
export async function ValQ(id) {

    try {

        const reference = doc(db, "quetes", id);

        await deleteDoc(reference);

        console.log("Quête supprimée !");

    } catch (erreur) {

        console.error("Erreur suppression quête :", erreur);

    }
}
export async function MakeQ(name, id) {

    try {

        const reference = doc(db, "quetes", id);

        await updateDoc(reference, {
            fait: name
        });

        console.log("Quête terminée !");

    } catch (erreur) {

        console.error("Erreur modification quête :", erreur);

    }
}
export async function AddF(a) {

    try {

        await addDoc(collection(db, "forum"), {
            uid: auth.currentUser.uid,
            exp: a.exp,
            cont: a.cont,
            date: a.date,
            timestamp: Date.now()
        });

        console.log("Message ajouté !");

    } catch (erreur) {

        console.error("Erreur ajout message :", erreur);

    }
}
export async function DellF(id) {

    try {

        await deleteDoc(doc(db, "forum", id));

        console.log("Message supprimé !");

    } catch (erreur) {

        console.error("Erreur suppression message :", erreur);

    }
}

export function SwitchCompte(c){
    CurrentCompte=c;
}
export function ValT(n){
    Transactions.splice(n,1);
    localStorage.setItem("Transactions", JSON.stringify(Transactions));
}

export async function AddTransaction(a) {

    try {

        await addDoc(collection(db, "transactions"), {
            exp: a.exp,
            dest: a.dest,
            argent: Number(a.argent),
            obj: a.obj,
            timestamp: Date.now()
        });

        console.log("Transaction ajoutée !");

    } catch (erreur) {

        console.error("Erreur ajout transaction :", erreur);

    }
}

export function SwArgT(exp,dest,arg){
    arg = Number(arg);
    Comptes.forEach(element => {
        if (element.name===exp){
            element.argent+=arg;
        }
        else if(element.name===dest){
            element.argent-=arg;
        }
    });
    ReLoadCC();
    localStorage.setItem("Comptes", JSON.stringify(Comptes));
}

function ReLoadCC(){
    Comptes.forEach(element => {
        if(element.name===CurrentCompte.name){
            CurrentCompte=element;
        }
    });
}

if (sauvegardeCC) {
    CurrentCompte = JSON.parse(sauvegardeCC);
}
if (sauvegardeT) {
    Transactions = JSON.parse(sauvegardeT);
}