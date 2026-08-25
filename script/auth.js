import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
    doc,setDoc,getDoc} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import { db } from "./firebase.js";
import { auth } from "./firebase.js";


// =========================
// CRÉER UN COMPTE
// =========================

export async function creerCompteFirebase(email, mdp) {

    try {

        const resultat = await createUserWithEmailAndPassword(
            auth,
            email,
            mdp
        );

        console.log("Compte créé !");
        console.log("UID :", resultat.user.uid);

        return resultat.user;

    } catch (erreur) {

        console.error("Erreur création :", erreur);

        return null;
    }
}

export async function creerProfil(user, donnees) {

    try {
        
        await setDoc(doc(db, "users", user.uid), {
            name: donnees.nom,
            métier: donnees.metier,
            argent: donnees.argent,
            grade: "novice",
            modo: "non",
            CanLoad: false
        });

        console.log("Profil Firestore créé !");

        return true;

    } catch (erreur) {

        console.error("Erreur création profil :", erreur);

        return false;
    }
}

// =========================
// SE CONNECTER
// =========================

export async function connexionFirebase(email, mdp) {

    try {

        // 1. Connexion avec Firebase Authentication
        const resultat = await signInWithEmailAndPassword(
            auth,
            email,
            mdp
        );

        const user = resultat.user;

        console.log("Connexion Firebase réussie !");
        console.log("UID :", user.uid);


        // 2. Récupérer le profil Firestore
        const reference = doc(db, "users", user.uid);
        const profil = await getDoc(reference);


        // 3. Vérifier que le profil existe
        if (!profil.exists()) {

            console.error("Profil Firestore introuvable !");

            return null;
        }


        // 4. Récupérer les données du profil
        const donnees = profil.data();

        console.log("Profil :", donnees);


        // 5. Vérifier CanLoad
        if (donnees.CanLoad !== true) {

            console.log("Connexion refusée : CanLoad est false.");

            await signOut(auth);

            return "CANLOAD_FALSE";
        }


        // 6. Tout est bon
        console.log("Connexion autorisée !");

        return user;


    } catch (erreur) {

        console.error("Erreur connexion :", erreur);

        return null;
    }
}
export async function recupererProfil(user) {

    try {

        const reference = doc(db, "users", user.uid);
        const resultat = await getDoc(reference);

        if (resultat.exists()) {

            console.log("Profil récupéré :", resultat.data());

            return resultat.data();

        } else {

            console.log("Le profil n'existe pas !");
            return null;
        }

    } catch (erreur) {

        console.error("Erreur récupération profil :", erreur);
        return null;
    }
}

// =========================
// SURVEILLER LA CONNEXION
// =========================

export function surveillerConnexion(fonction) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            console.log("Personne n'est connecté");
            fonction(null);
            return;
        }

        console.log("Utilisateur connecté :", user.uid);

        // Récupérer son profil Firestore
        const reference = doc(db, "users", user.uid);
        const profil = await getDoc(reference);

        // Le profil n'existe pas
        if (!profil.exists()) {

            console.log("Profil Firestore introuvable.");

            await signOut(auth);

            fonction(null);
            return;
        }

        const donnees = profil.data();

        console.log("Profil :", donnees);

        // Vérification de CanLoad
        if (donnees.CanLoad !== true) {

            console.log("Accès refusé : CanLoad est false.");

            await signOut(auth);

            fonction(null);
            return;
        }

        // Utilisateur autorisé
        console.log("Accès autorisé.");

        fonction(user);

    });

}

