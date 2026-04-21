// variablen
let alleNotities = [];
let notitieSneltoets = "a"; 
let kolomSwitchSneltoets = " "; 

let setupFase = 1; 
let tijdelijkeToets = "";
let sessieNotitieTeller = 0;

// verboden toetsen (systeemtoetsen)
const systeemToetsen = ["control", "alt", "meta", "shift", "capslock", "tab", "escape", "arrowup", "arrowdown", "arrowleft", "arrowright"];

// initialisatie
window.onload = function() {
    laadNotities();

    // Directe instructie bij start voor VoiceOver
    // let startInstructie = document.getElementById("start-instructie");
    // if (startInstructie) {
    //     startInstructie.innerText = "Gebruik de Tab-toets om door de pagina te navigeren.";
    // }

    // wis aria live van de notitie marge om te voorkomen dat de voice over deze later nogmaals voorleest
    document.querySelectorAll(".marge-notities").forEach(marge => {
        marge.removeAttribute("aria-live");
    });
};

// functie om quote ID te bepalen op basis van het element dat focus heeft
function getQuoteId(element) {
    if (element.classList.contains("filosofie-quote")) return element.id;
    if (element.classList.contains("marge-notities")) return element.id.replace("marge-", "");
    if (element.classList.contains("notitie-kaart")) return element.closest(".marge-notities").id.replace("marge-", "");
    return null;
}

// MARK: functie toetsinteract.
// event listener luistert naar alle keydown events op de pagina
document.addEventListener("keydown", function (event) {

    // MARK: setup fase
    // variabele voor de ingedrukt toets, maak het lowercase voor consistentie
    let toets = event.key.toLowerCase();
    
    // als we in een setup fase wachten op de screenreader, neer dan alle toetsen behalve de bevestigingstoetsen
    if (setupFase === 2.5 || setupFase === 4.5) {
        event.preventDefault();
        return;
    }

    // als we in een setup fase zijn, behandel dan de sneltoetsconfiguratie
    if (setupFase > 0) {
        // negeer lang ingedrukt houden van een toets en blokkeer bedieningstoetsen
        if (event.repeat) return; 
        // if (["tab", "shift", "control", "alt", "meta", "capslock"].includes(toets)) return;
        event.preventDefault();

        // haal elementen op waar screenreader feedback en status updates worden getoond
        let statusBlok = document.getElementById("config-status-blok");
        let actieFeedback = document.getElementById("actie-feedback");
        let leesbaar = (toets === " ") ? "Spatiebalk" : toets.toUpperCase();

        // check op verboden toetsen
        if (systeemToetsen.includes(toets)) {
            actieFeedback.innerHTML = "Deze systeemtoets kan niet gebruikt worden. Kies een letter, getal of de spatiebalk.";
            statusBlok.classList.remove("verborgen");
            return;
        }

        // fase 1: kies sneltoets voor notities maken
        if (setupFase === 1) {
            tijdelijkeToets = toets;
            statusBlok.classList.remove("verborgen");
            actieFeedback.innerHTML = `Gekozen: <strong>${leesbaar}</strong>, Druk nogmaals om te bevestigen.`;
            setupFase = 2;
        } 
        // fase 2: bevestig sneltoets voor notities maken
        else if (setupFase === 2) {
            // als de gebruiker dezelfde toets indrukt, sla deze dan op als sneltoets voor notities
            if (toets === tijdelijkeToets) {
                notitieSneltoets = toets;
                
                actieFeedback.innerHTML = `Opgeslagen! Notitietoets is  <strong>${leesbaar}</strong>`;
                setupFase = 2.5; 

                // na een korte pauze, ga verder naar de volgende stap van de setup
                setTimeout(function() {
                    statusBlok.classList.add("verborgen");
                    actieFeedback.innerHTML = "";

                    // verberg het eerste stap blok en toon het tweede stap blok
                    document.getElementById("stap-1-blok").classList.add("verborgen");
                    let stap2 = document.getElementById("stap-2-blok");
                    if (stap2) {
                        stap2.classList.remove("verborgen");
                        stap2.focus();
                    }
                    
                    setupFase = 3;
                }, 3300);

            // als de gebruiker een andere toets indrukt, update dan de tijdelijke keuze en vraag om bevestiging
            } else {
                tijdelijkeToets = toets;
                actieFeedback.innerHTML = `Nieuwe keuze: <strong>${leesbaar}</strong>, Druk nogmaals om te bevestigen.`;
            }
        }
        // fase 3: kies sneltoets voor kolom switchen
        else if (setupFase === 3) {
            tijdelijkeToets = toets;
            statusBlok.classList.remove("verborgen");
            actieFeedback.innerHTML = `Gekozen: <strong>${leesbaar}</strong>, Druk nogmaals om te bevestigen.`;
            setupFase = 4;
        }
        // fase 4: bevestig sneltoets voor kolom switchen
        else if (setupFase === 4) {
            if (toets === tijdelijkeToets) {
                kolomSwitchSneltoets = toets;
                
                actieFeedback.innerHTML = `Opgeslagen! Switchtoets is  <strong>${leesbaar}</strong>`;
                setupFase = 4.5;

                // na een korte pauze, voltooi de setup en toon de hoofdapplicatie
                setTimeout(function() {
                    statusBlok.classList.add("verborgen");
                    actieFeedback.innerHTML = "";

                    // verberg het tweede stap blok en toon het derde stap blok
                    document.getElementById("stap-2-blok").classList.add("verborgen");
                    let stap3 = document.getElementById("stap-3-blok");
                    if (stap3) {
                        stap3.classList.remove("verborgen");
                        stap3.focus();
                    }
                    
                    setupFase = 5;
                }, 3300);

            // als de gebruiker een andere toets indrukt, update dan de tijdelijke keuze en vraag om bevestiging
            } else {
                tijdelijkeToets = toets;
                actieFeedback.innerHTML = `Nieuwe keuze: <strong>${leesbaar}</strong>, Druk nogmaals om te bevestigen.`;
            }
        }
        // fase 5: wacht op enter om setup te voltooien en hoofdapplicatie te tonen
        else if (setupFase === 5 && toets === "enter") {
            let config = document.getElementById("sneltoets-configurator");
            if (config) config.classList.add("verborgen");
            
            // toon de hoofdapplicatie
            let app = document.getElementById("hoofd-applicatie");
            if (app) app.classList.remove("verborgen");
            
            setupFase = 0;

            vertelAanScreenreader("Jij hebt de controle, Roger. Tijd om te filosoferen.");

            setTimeout(function() {
                let eersteQuote = document.querySelector(".filosofie-quote");
                if (eersteQuote) eersteQuote.focus();
            }, 4500);
        }
        return; 
    }

    // MARK: werking fase
    // bepaal welk element momenteel focus heeft
    let focus = document.activeElement;

    // als de focus op een textarea staat, laat dan de enter toets toe om een nieuwe regel te maken, en negeer alle andere sneltoetsen
    if (focus.tagName === "TEXTAREA") {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("opslaan-knop").click();
        }
        return;
    }

    // bepaal het quote ID op basis van het element dat focus heeft
    let quoteId = getQuoteId(focus);

    // gebruik de sneltoetsen om notities te openen of te switchen tussen kolommen, afhankelijk van waar de focus is
    if (toets === notitieSneltoets && quoteId) {
        event.preventDefault();
        openFormulier(quoteId);
    } 
    // zorg dat de kolomswitch alleen werkt als er een geldig quoteId is, en voorkom fouten als er per ongeluk op de switchtoets wordt gedrukt zonder dat er een quote in focus is
    else if (toets === kolomSwitchSneltoets && quoteId) {
        event.preventDefault();
        switchKolom(focus, quoteId);
    } 
    // zorg dat de navigatie door notities alleen werkt als de focus op een notitiekaart of marge-notities staat, en voorkom fouten als er per ongeluk op de tab-toets wordt gedrukt terwijl er geen notities in focus zijn
    else if (event.key === "Tab" && (focus.classList.contains("notitie-kaart") || focus.classList.contains("marge-notities"))) {
        event.preventDefault();
        navigeerDoorNotities(focus, event.shiftKey);
    }
});

// MARK: functie notitieform.
function openFormulier(quoteId) {
    // haal het formulier en invoerveld op
    let formulier = document.getElementById("notitie-formulier");
    let invoerVeld = document.getElementById("input-notitie");

    // alleen verder gaan als formulier en invoerveld gevonden zijn
    if (!formulier || !invoerVeld) return;

    // markeer de quote als actief en koppel het formulier aan deze quote
    document.getElementById(quoteId).classList.add("actieve-quote");
    formulier.dataset.gekoppeldeQuoteId = quoteId;
    
    // haal bestaande notitie op voor deze quote, en vul het invoerveld met de opgeslagen tekst (of leeg als er nog geen notitie is)
    let bestaande = alleNotities.find(n => n.quoteId === quoteId);
    let opgeslagenTekst = bestaande ? (bestaande.notitie || bestaande.annotatie) : "";
    
    // als notitie alleen het woord 'undefined' bevat, wis deze dan
    if (opgeslagenTekst === "undefined") opgeslagenTekst = "";
    
    // vul het invoerveld met de opgeslagen tekst en geef feedback aan de screenreader over of we een bestaande notitie bewerken of een nieuwe maken
    invoerVeld.value = opgeslagenTekst;
    
    if (bestaande) {
        invoerVeld.setAttribute("aria-label", "Notitie bewerken. Huidige notitie:");
    } else {
        invoerVeld.setAttribute("aria-label", "Nieuwe notitie. Typ uw notitie en sla deze op met de toets Enter.");
    }

    // plaats het formulier in de marge naast de quote, maak het zichtbaar en focus op het invoerveld
    document.getElementById("marge-" + quoteId).appendChild(formulier);
    formulier.classList.remove("verborgen");
    invoerVeld.focus();
}

// MARK: functie kolomswitch
function switchKolom(focus, quoteId) {
    // als de focus op een quote staat, focus op notitie in marge | als de focus in de marge staat, focus terug op de quote
    if (focus.classList.contains("filosofie-quote")) {
        // variabelen voor marge en notities binnen de marge
        let marge = document.getElementById("marge-" + quoteId);
        let notitie = marge.querySelector(".notitie-kaart");
        // als er een notitiekaart is, focus daarop
        if (notitie) {
            notitie.focus();
        // anders focus op de lege marge en vertel dat deze leeg is
        } else {
            marge.setAttribute("tabindex", "-1");
            marge.removeAttribute("role", "paragraph");
            marge.focus();
            const legeMargeZinnen = [ 
                "Hier is nog ruimte voor genialiteit.", 
                "Nog geen notities. Tijd om na te denken.", 
                "Een leeg canvas voor je gedachten."
            ];
            vertelAanScreenreader(legeMargeZinnen[Math.floor(Math.random() * legeMargeZinnen.length)]);
        }
    // als de focus in de marge of op een notitiekaart staat, focus dan terug op de quote en vertel dat we terug in de tekst zijn
    } else {
        document.getElementById(quoteId).focus();
        vertelAanScreenreader("Terug in de tekst.");
    }
}

// MARK: functie navigatie
function navigeerDoorNotities(focus, isShift) {
    // haal alle marges op, bepaal welke marge momenteel in focus is, en vind de index van die marge
    let alleMarges = Array.from(document.querySelectorAll(".marge-notities"));
    let huidigeMarge = focus.closest(".marge-notities") || focus;
    let index = alleMarges.indexOf(huidigeMarge);
    
    let doelIndex = isShift ? index - 1 : index + 1;
    
    // controleer of we niet voorbij de eerste of laatste marge gaan
    if (doelIndex >= 0 && doelIndex < alleMarges.length) {
        let doelMarge = alleMarges[doelIndex];
        let notitieDaarin = doelMarge.querySelector(".notitie-kaart");
        
        if (notitieDaarin) {
            notitieDaarin.focus();
        } else {
            doelMarge.setAttribute("tabindex", "-1");
            doelMarge.removeAttribute("role", "paragraph");
            doelMarge.focus();
            const legeMargeZinnen = [
                "Zo leeg als een tabula rasa.", 
                "Hier is nog ruimte voor genialiteit.", 
                "Nog geen notities. Tijd om na te denken.", 
                "Een leeg canvas voor je gedachten."
            ];
            vertelAanScreenreader(legeMargeZinnen[Math.floor(Math.random() * legeMargeZinnen.length)]);
        }
    // waarschuw screenreader bij bovenste of onderste regel
    } else {
        vertelAanScreenreader(isShift ? "Bovenste regel." : "Onderste regel.");
    }
}

// MARK: functie opslaan
document.getElementById("opslaan-knop").addEventListener("click", function() {
    // haal het formulier en invoerveld op
    let formulier = document.getElementById("notitie-formulier");
    let invoerVeld = document.getElementById("input-notitie");

    if (!formulier || !invoerVeld) return;

    // bepaal het quote ID, en de nieuwe tekst van het invoerveld
    let quoteId = formulier.dataset.gekoppeldeQuoteId;
    let nieuweTekst = invoerVeld.value;

    // zoek bestaande notitie bij de quote
    let bestaande = alleNotities.find(n => n.quoteId === quoteId);
    // als bestaande notitie: update deze met de nieuwe tekst
    if (bestaande) {
        bestaande.notitie = nieuweTekst;
        let kaart = document.querySelector(`#marge-${quoteId} .notitie-kaart`);
        // if (kaart) { 
        //     kaart.setAttribute("aria-label", `Notitie: ${nieuweTekst}`);
        //     kaart.innerHTML = `<span aria-hidden="true"><strong>Notitie:</strong> ${nieuweTekst}</span>`;
        // }
        if (kaart) { 
            kaart.removeAttribute("aria-label");
            kaart.innerHTML = `<strong>Notitie:</strong> ${nieuweTekst}`;
        }
    // anders: maak nieuwe notitie
    } else {
        let nieuweNotitie = { quoteId: quoteId, notitie: nieuweTekst };
        alleNotities.push(nieuweNotitie);
        zetOpScherm(nieuweNotitie);
    }

    // bewaar het onder beide sleutels in localStorage voor absolute veiligheid
    localStorage.setItem("roger_notities", JSON.stringify(alleNotities));
    
    // reset formulier en verberg het
    invoerVeld.value = "";
    formulier.classList.add("verborgen");
    document.getElementById(quoteId).classList.remove("actieve-quote");

    let opgeslagenKaart = document.querySelector(`#marge-${quoteId} .notitie-kaart`);
    if (opgeslagenKaart) {
        opgeslagenKaart.setAttribute("role", "paragraph");
        opgeslagenKaart.focus();
    }

    sessieNotitieTeller++; 
    let wachttijdFocus = 4000;
    
    setTimeout(function() {
        if (sessieNotitieTeller % 3 === 0) {
            vertelAanScreenreader("Hoera, 3 nieuwe notities, ga zo door! Hier wat confetti om het te vieren.");
            wachttijdFocus = 9000;
            
            // wacht even (ongeveer tot de zin is uitgesproken)
            setTimeout(function() {
            confetti({
                particleCount: 3000,      
                spread: 700,             
                origin: { y: 0.7 },      
                colors: ['#ffee00', '#79a6e6', '#ffffff', '#ff0000'],
                zIndex: 9999
            });
        }, 3500);

        } else {
            const complimenten = [
                "Opgeslagen! Wat ben je weer lekker bezig.",
                "Staat genoteerd. Je brein draait op volle toeren!",
                "Veilig opgeborgen. Topwerk, Roger!",
                "Check! Die notitie pakken ze je niet meer af.",
                "Succesvol bewaard. Roger for president!",
                "Hoppa, opgeslagen! Ga zo door.",
                "Opgeslagen. Weer een meesterwerkje voor het archief!"
            ];
            vertelAanScreenreader(complimenten[Math.floor(Math.random() * complimenten.length)]);
            wachttijdFocus = 4000;
        }
    }, 800);

    // wacht 4 seconden (voor geven compliment) en verplaats daarna de focus
    setTimeout(function() {
        let alleQuotes = Array.from(document.querySelectorAll(".filosofie-quote"));
        let huidigeIndex = alleQuotes.indexOf(document.getElementById(quoteId));
        
        if (huidigeIndex < alleQuotes.length - 1) {
            alleQuotes[huidigeIndex + 1].focus();
        } else {
            document.getElementById(quoteId).focus();
        }
    }, wachttijdFocus); 
});

// MARK: functie toon notities
function laadNotities() {
    // haal opgeslagen notities op uit localStorage, of start met een lege array als er nog geen notities zijn
    let bewaardeData = JSON.parse(localStorage.getItem("roger_notities")) || [];
    alleNotities = bewaardeData;
    alleNotities.forEach(zetOpScherm);
}

// MARK: functie zetopscherm
function zetOpScherm(data) {
    // maak een nieuwe notitiekaart aan, zet de tekst erin, en plaats deze in de marge naast de juiste quote
    let nieuw = document.createElement("div");
    nieuw.setAttribute("tabindex", "-1");
    nieuw.setAttribute("role", "paragraph");
    nieuw.classList.add("notitie-kaart");
    
    // toon notitie 
    let toonTekst = data.notitie;
    if (toonTekst === undefined) toonTekst = data.annotatie;
    if (toonTekst === undefined || toonTekst === "undefined") toonTekst = "";
    
    // laat de notitie zien
    nieuw.innerHTML = `Notitie: ${toonTekst}`;
    document.getElementById("marge-" + data.quoteId)?.appendChild(nieuw);

    // koppel aan de juiste quote
    let gekoppeldeQuote = document.getElementById(data.quoteId);
    
    // voeg notitie icoon toe als deze er nog niet was
    if (gekoppeldeQuote && !gekoppeldeQuote.querySelector('.notitie-icoon')) {
        let icoon = document.createElement("img");
        icoon.src = "./images/annotatie1.png"; 
        icoon.setAttribute("aria-hidden", "true"); 
        icoon.classList.add("notitie-icoon");
        
        let srTekst = document.createElement("span");
        srTekst.classList.add("sr-only");
        srTekst.innerText = "Notitie aanwezig. ";
        
        gekoppeldeQuote.prepend(srTekst);
        gekoppeldeQuote.prepend(icoon);
    }
}

// MARK: functie screenreader
function vertelAanScreenreader(tekst) {
    // update de tekst van een verborgen element dat bedoeld is voor screenreader feedback
    // document.getElementById("screenreader-feedback").innerText = tekst;
    let feedbackBlok = document.getElementById("screenreader-feedback");
    
    // Maak het blokje even leeg (reset)
    feedbackBlok.innerText = "";
    
    // Geef VoiceOver 100 milliseconden om adem te halen, en vul het dan pas in
    setTimeout(function() {
        feedbackBlok.innerText = tekst;
    }, 100);
}

// MARK: functie focus
document.addEventListener("focusin", function(event) {
    // haal het formulier en invoerveld op
    let formulier = document.getElementById("notitie-formulier");
    let invoerVeld = document.getElementById("input-notitie");

    // als er een formulier is && zichtbaar is && de focus is buiten het formulier
    if (formulier && !formulier.classList.contains("verborgen") && !formulier.contains(event.target)) {
        // verberg het formulier
        formulier.classList.add("verborgen");
        // haal quote ID op 
        let quoteId = formulier.dataset.gekoppeldeQuoteId;
        // verwijder actieve class van de quote
        if (quoteId) document.getElementById(quoteId)?.classList.remove("actieve-quote");
        // reset het invoerveld
        if (invoerVeld) invoerVeld.value = "";
    }
});