console.log('Hello world');

// Huidige quote onthouden
let actieveQuoteTekst = "";

// Een lege lijst (Array) waar we alle annotaties in gaan stoppen
let alleAnnotaties = [];

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
document.getElementById("opslaan-knop").addEventListener("click", function() {
    
    // 1. Haal op wat Roger heeft getypt
    let inputAnnotatie = document.getElementById("input-annotatie").value;
    let inputConcept = document.getElementById("input-concept").value;
    let inputTag = document.getElementById("input-tag").value;

    // 2. Maak een 'pakketje' (Object) van deze specifieke annotatie
    let nieuweNotitie = {
        quote: actieveQuoteTekst,
        annotatie: inputAnnotatie,
        concept: inputConcept,
        tag: inputTag
    };

    // 3. Voeg dit pakketje toe aan onze grote lijst
    alleAnnotaties.push(nieuweNotitie);

    // 4. Sla de hele lijst op in localStorage (we vouwen het plat met JSON.stringify)
    localStorage.setItem("roger_annotaties", JSON.stringify(alleAnnotaties));

    // 5. Zet hem op het scherm met onze nieuwe slimme functie
    zetOpScherm(nieuweNotitie);

    // 6. Maak de invulvakjes weer leeg
    document.getElementById("input-annotatie").value = "";
    document.getElementById("input-concept").value = "";
    document.getElementById("input-tag").value = "";

    // 7. Verberg het formulier weer
    document.getElementById("annotatie-formulier").style.display = "none";

    // 8. Geef audio-feedback
    vertelAanScreenreader("Opgeslagen. Je kunt verder lezen.");
});

// Functie voor de onzichtbare audio-feedback
function vertelAanScreenreader(tekst) {
    document.getElementById("screenreader-feedback").innerText = tekst;
}

// Checken of er al iets in de localStorage zit
function laadAnnotaties() {
    let bewaardeData = localStorage.getItem("roger_annotaties");
    
    // Als er data is gevonden:
    if (bewaardeData !== null) {
        // Pak uit localStorage, zet om van string naar lijst
        alleAnnotaties = JSON.parse(bewaardeData);
        
        // Loop door elke opgeslagen annotatie en zet hem op het scherm
        for (let i = 0; i < alleAnnotaties.length; i++) {
            zetOpScherm(alleAnnotaties[i]);
        }
    }
}

// Roep deze functie direct één keer aan zodra het script start!
laadAnnotaties();

// Maak HTML block van de data en zet op scherm
function zetOpScherm(data) {
    let nieuwItem = document.createElement("div");
    nieuwItem.setAttribute("tabindex", "0"); 
    nieuwItem.classList.add("annotatie-kaart");
    
    // We halen de data nu uit het 'data' pakketje
    nieuwItem.innerHTML = `
            <div class="quote-tekst">"${data.quote}"</div>
            <div class="annotatie-details">
                <span><strong>Annotatie:</strong> ${data.annotatie}</span>
                <span><strong>Concept:</strong> ${data.concept}</span>
                <span><strong>Tag:</strong> ${data.tag}</span>
            </div>
        `;

    document.getElementById("opgeslagen-lijst").appendChild(nieuwItem);
}

// Luister naar elke keer dat de focus ('de cursor') ergens anders naartoe springt
document.addEventListener("focusin", function(event) {
    let actiefElement = event.target; // Waar is Roger nu?
    let body = document.body;

    // Haal eerst even alle oude kleuren weg
    body.classList.remove("modus-lezen", "modus-annoteren", "modus-overzicht");

    // 1. Zit hij ergens ín het formulier? (.closest kijkt of het element in dat blok zit)
    if (actiefElement.closest("#annotatie-formulier")) {
        body.classList.add("modus-annoteren");
    }
    // 2. Zit hij ergens ín het blok met opgeslagen annotaties?
    else if (actiefElement.closest("#mijn-opgeslagen-annotaties")) {
        body.classList.add("modus-overzicht");
    }
    // 3. Heeft het element waar hij op zit een ID dat begint met 'quote-'?
    else if (actiefElement.id && actiefElement.id.startsWith("quote-")) {
        body.classList.add("modus-lezen");
    }
});

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