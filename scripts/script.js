console.log('Hello world');

// Huidige quote onthouden
let actieveQuoteTekst = "";

document.addEventListener("keydown", function (event) {

    // Als Roger in een input field typt moeten de shortcuts niet werken
    if (document.activeElement.tagName === "INPUT") {
        return;
    }

    let ingedrukteToets = event.key.toLowerCase();

    // a
    if (ingedrukteToets === "a") {

        // Zorgt ervoor dat er geen a wordt getypt in het input field
        event.preventDefault();

        // Sla huidige tekst op
        let huidigeLocatie = document.activeElement;
        actieveQuoteTekst = huidigeLocatie.innerText;

        // Formulier laten zien
        document.getElementById("annotatie-formulier").style.display = "block";

        // Focus in eerste input field
        document.getElementById("input-annotatie").focus();

        vertelAanScreenreader("Formulier geopend. Typ je annotatie.");
    }
});

// Bij klikken opslaan knop
document.getElementById("opslaan-knop").addEventListener("click", function () {

    // Wat Roger in de velden getypt heeft
    let annotatie = document.getElementById("input-annotatie").value;
    let concept = document.getElementById("input-concept").value;
    let tag = document.getElementById("input-tag").value;

    // Maak nieuwe p
    let nieuwItem = document.createElement("p");

    // Geef tabindex 0 zodat screenreader daarheen kan navigeren
    nieuwItem.setAttribute("tabindex", "0");

    // Plak alle tekst aan elkaar
    nieuwItem.innerText = "Quote: " + actieveQuoteTekst + " Annotatie: " + annotatie + " Concept: " + concept + " Tag: " + tag;

    // Zet geheel op de annotatie lijst
    document.getElementById("opgeslagen-lijst").appendChild(nieuwItem);

    // Leeg velden
    document.getElementById("input-annotatie").value = "";
    document.getElementById("input-concept").value = "";
    document.getElementById("input-tag").value = "";

    // Verberg het formulier 
    document.getElementById("annotatie-formulier").style.display = "none";

    // Positieve feedback
    vertelAanScreenreader("Opgeslagen. Je kunt verder lezen.");
});

// Functie voor de onzichtbare audio-feedback
function vertelAanScreenreader(tekst) {
    document.getElementById("screenreader-feedback").innerText = tekst;
}

// document.addEventListener("keydown", function(event) {
//     let ingedrukteToets = event.key.toLowerCase();

//     console.log(ingedrukteToets);

//     if (ingedrukteToets === "a") {
//         console.log("Toets = a");
//     }
// })

// Tijdelijke antwoorden
// let opgeslagenAnnotatie = "";
// let opgeslagenTag = "";
// let opgeslagenConcept = "";

// // Luister functie
// document.addEventListener("keydown", function(event) {

//     // Welke toets is ingedrukt?
//     let ingedrukteToets = event.key.toLowerCase();

//     // A
//     if (ingedrukteToets === "a") {

//         // Waar is hij nu
//         let huidigeLocatie = document.activeElement;

//         // Haal de tekst op
//         let huidigeTekst = huidigeLocatie.innerText;

//         // Annotatie melding met daarbij bij welke zin
//         opgeslagenAnnotatie = prompt("Je maakt een annotatie bij de tekst: '" + huidigeTekst + "'. Wat is je annotatie?");

//         console.log("Bij ID:", huidigeLocatie.id, "schreef Roger:", opgeslagenAnnotatie);

//         vertelAanScreenreader("Annotatie opgeslagen en gekoppeld.");
//     }

//     // T
//     else if (ingedrukteToets === "t") {
//         opgeslagenTag = prompt("Welke tag wil je toevoegen?");
//         vertelAanScreenreader("Tag " + opgeslagenTag + " toegevoegd.");
//     }

//     // C
//     else if (ingedrukteToets === "c") {
//         opgeslagenConcept = prompt("Aan welk concept wil je dit koppelen?");
//         vertelAanScreenreader("Gekoppeld aan " + opgeslagenConcept);
//     }

//     // Enter
//     else if (ingedrukteToets === "enter") {
//         console.log("Resultaat:", opgeslagenAnnotatie, opgeslagenTag, opgeslagenConcept);

//         // Vertel Roger dat alles gelukt is
//         alert("Alles is opgeslagen. Je kunt verder lezen.");

//         // Maak weer leeg
//         opgeslagenAnnotatie = "";
//         opgeslagenTag = "";
//         opgeslagenConcept = "";
//     }
// });

// // Functie om tekst aan te passen zodat screenreader het voorleest
// function vertelAanScreenreader(tekst) {
//     document.getElementById("screenreader-feedback").innerText = tekst;
// }