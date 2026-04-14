let alleNotities = [];
let notitieSneltoets = "a"; 
let kolomSwitchSneltoets = " "; 

let setupFase = 1; 
let tijdelijkeToets = "";

window.onload = function() {
    laadNotities();
};

function getQuoteId(element) {
    if (element.classList.contains("filosofie-quote")) return element.id;
    if (element.classList.contains("marge-notities")) return element.id.replace("marge-", "");
    if (element.classList.contains("notitie-kaart")) return element.closest(".marge-notities").id.replace("marge-", "");
    return null;
}

document.addEventListener("keydown", function (event) {
    let toets = event.key.toLowerCase();
    
    if (setupFase === 2.5 || setupFase === 4.5) {
        event.preventDefault();
        return;
    }

    if (setupFase > 0) {
        if (event.repeat) return; 
        if (["tab", "shift", "control", "alt", "meta", "capslock"].includes(toets)) return;
        event.preventDefault();

        let statusBlok = document.getElementById("config-status-blok");
        let actieFeedback = document.getElementById("actie-feedback");
        let leesbaar = (toets === " ") ? "Spatiebalk" : toets.toUpperCase();

        if (setupFase === 1) {
            tijdelijkeToets = toets;
            statusBlok.classList.remove("verborgen");
            actieFeedback.innerHTML = `Gekozen: <strong>${leesbaar}</strong>  Druk nogmaals om te bevestigen.`;
            setupFase = 2;
        } 
        else if (setupFase === 2) {
            if (toets === tijdelijkeToets) {
                notitieSneltoets = toets;
                
                actieFeedback.innerHTML = `Opgeslagen! Notitietoets is  <strong>${leesbaar}</strong>`;
                setupFase = 2.5; 

                setTimeout(function() {
                    statusBlok.classList.add("verborgen");
                    actieFeedback.innerHTML = "";

                    document.getElementById("stap-1-blok").classList.add("verborgen");
                    let stap2 = document.getElementById("stap-2-blok");
                    if (stap2) {
                        stap2.classList.remove("verborgen");
                        stap2.focus();
                    }
                    
                    setupFase = 3;
                }, 3500);

            } else {
                tijdelijkeToets = toets;
                actieFeedback.innerHTML = `Nieuwe keuze: <strong>${leesbaar}</strong>  Druk nogmaals om te bevestigen.`;
            }
        }
        else if (setupFase === 3) {
            tijdelijkeToets = toets;
            statusBlok.classList.remove("verborgen");
            actieFeedback.innerHTML = `Gekozen: <strong>${leesbaar}</strong>  Druk nogmaals om te bevestigen.`;
            setupFase = 4;
        }
        else if (setupFase === 4) {
            if (toets === tijdelijkeToets) {
                kolomSwitchSneltoets = toets;
                
                actieFeedback.innerHTML = `Opgeslagen! Switchtoets is  <strong>${leesbaar}</strong>`;
                setupFase = 4.5;

                setTimeout(function() {
                    statusBlok.classList.add("verborgen");
                    actieFeedback.innerHTML = "";

                    document.getElementById("stap-2-blok").classList.add("verborgen");
                    let stap3 = document.getElementById("stap-3-blok");
                    if (stap3) {
                        stap3.classList.remove("verborgen");
                        stap3.focus();
                    }
                    
                    setupFase = 5;
                }, 3500);

            } else {
                tijdelijkeToets = toets;
                actieFeedback.innerHTML = `Nieuwe keuze: <strong>${leesbaar}</strong>  Druk nogmaals om te bevestigen.`;
            }
        }
        else if (setupFase === 5 && toets === "enter") {
            let config = document.getElementById("sneltoets-configurator");
            if (config) config.classList.add("verborgen");
            
            let app = document.getElementById("hoofd-applicatie");
            if (app) app.classList.remove("verborgen");
            
            setupFase = 0;
            
            let eersteQuote = document.querySelector(".filosofie-quote");
            if (eersteQuote) eersteQuote.focus();
        }
        return; 
    }

    let focus = document.activeElement;

    if (focus.tagName === "TEXTAREA") {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("opslaan-knop").click();
        }
        return;
    }

    let quoteId = getQuoteId(focus);

    if (toets === notitieSneltoets && quoteId) {
        event.preventDefault();
        openFormulier(quoteId);
    } 
    else if (toets === kolomSwitchSneltoets && quoteId) {
        event.preventDefault();
        switchKolom(focus, quoteId);
    } 
    else if (event.key === "Tab" && (focus.classList.contains("notitie-kaart") || focus.classList.contains("marge-notities"))) {
        event.preventDefault();
        navigeerDoorNotities(focus, event.shiftKey);
    }
});

function openFormulier(quoteId) {
    // Vangt zowel oude als nieuwe HTML op
    let formulier = document.getElementById("notitie-formulier") || document.getElementById("annotatie-formulier");
    let invoerVeld = document.getElementById("input-notitie") || document.getElementById("input-annotatie");

    if (!formulier || !invoerVeld) return;

    document.getElementById(quoteId).classList.add("actieve-quote");
    formulier.dataset.gekoppeldeQuoteId = quoteId;
    
    let bestaande = alleNotities.find(n => n.quoteId === quoteId);
    let opgeslagenTekst = bestaande ? (bestaande.notitie || bestaande.annotatie) : "";
    
    // Wis het woordje 'undefined'
    if (opgeslagenTekst === "undefined") opgeslagenTekst = "";
    
    invoerVeld.value = opgeslagenTekst;
    vertelAanScreenreader(bestaande ? "Notitie bewerken." : "Nieuwe notitie.");

    document.getElementById("marge-" + quoteId).appendChild(formulier);
    formulier.classList.remove("verborgen");
    invoerVeld.focus();
}

function switchKolom(focus, quoteId) {
    if (focus.classList.contains("filosofie-quote")) {
        let marge = document.getElementById("marge-" + quoteId);
        let notitie = marge.querySelector(".notitie-kaart") || marge.querySelector(".annotatie-kaart");
        if (notitie) {
            notitie.focus();
            vertelAanScreenreader("Notitie gelezen.");
        } else {
            marge.setAttribute("tabindex", "-1");
            marge.focus();
            vertelAanScreenreader("Marge leeg.");
        }
    } else {
        document.getElementById(quoteId).focus();
        vertelAanScreenreader("Terug in de tekst.");
    }
}

function navigeerDoorNotities(focus, isShift) {
    let alleMarges = Array.from(document.querySelectorAll(".marge-notities"));
    let huidigeMarge = focus.closest(".marge-notities") || focus;
    let index = alleMarges.indexOf(huidigeMarge);
    
    let doelIndex = isShift ? index - 1 : index + 1;
    
    if (doelIndex >= 0 && doelIndex < alleMarges.length) {
        let doelMarge = alleMarges[doelIndex];
        let notitieDaarin = doelMarge.querySelector(".notitie-kaart") || doelMarge.querySelector(".annotatie-kaart");
        
        if (notitieDaarin) {
            notitieDaarin.focus();
        } else {
            doelMarge.setAttribute("tabindex", "-1");
            doelMarge.focus();
            vertelAanScreenreader("Lege marge.");
        }
    } else {
        vertelAanScreenreader(isShift ? "Bovenste regel." : "Onderste regel.");
    }
}

document.getElementById("opslaan-knop").addEventListener("click", function() {
    let formulier = document.getElementById("notitie-formulier") || document.getElementById("annotatie-formulier");
    let invoerVeld = document.getElementById("input-notitie") || document.getElementById("input-annotatie");

    if (!formulier || !invoerVeld) return;

    let quoteId = formulier.dataset.gekoppeldeQuoteId;
    let nieuweTekst = invoerVeld.value;

    let bestaande = alleNotities.find(n => n.quoteId === quoteId);
    if (bestaande) {
        bestaande.notitie = nieuweTekst;
        bestaande.annotatie = nieuweTekst; // Sla het veiligheidshalve dubbel op
        let kaart = document.querySelector(`#marge-${quoteId} .notitie-kaart`) || document.querySelector(`#marge-${quoteId} .annotatie-kaart`);
        if (kaart) kaart.innerHTML = `<div><strong>Notitie:</strong> ${nieuweTekst}</div>`;
    } else {
        let nieuweNotitie = { quoteId: quoteId, notitie: nieuweTekst, annotatie: nieuweTekst };
        alleNotities.push(nieuweNotitie);
        zetOpScherm(nieuweNotitie);
    }

    // Bewaar het onder beide sleutels in localStorage voor absolute veiligheid
    localStorage.setItem("roger_notities", JSON.stringify(alleNotities));
    localStorage.setItem("roger_annotaties", JSON.stringify(alleNotities));
    
    invoerVeld.value = "";
    formulier.classList.add("verborgen");
    document.getElementById(quoteId).classList.remove("actieve-quote");
    
    let alleQuotes = Array.from(document.querySelectorAll(".filosofie-quote"));
    let huidigeIndex = alleQuotes.indexOf(document.getElementById(quoteId));
    if (huidigeIndex < alleQuotes.length - 1) {
        alleQuotes[huidigeIndex + 1].focus();
    } else {
        document.getElementById(quoteId).focus();
    }
    vertelAanScreenreader("Opgeslagen.");
});

function laadNotities() {
    // Laad veilig oude of nieuwe geheugendata in
    let bewaardeData = JSON.parse(localStorage.getItem("roger_notities")) || JSON.parse(localStorage.getItem("roger_annotaties")) || [];
    alleNotities = bewaardeData;
    alleNotities.forEach(zetOpScherm);
}

function zetOpScherm(data) {
    let nieuw = document.createElement("div");
    nieuw.setAttribute("tabindex", "-1"); 
    nieuw.classList.add("notitie-kaart");
    
    // DE ULTIEME FIX: Kijk of het `notitie` of `annotatie` was, en blokkeer "undefined"
    let toonTekst = data.notitie;
    if (toonTekst === undefined) toonTekst = data.annotatie;
    if (toonTekst === undefined || toonTekst === "undefined") toonTekst = "";
    
    nieuw.innerHTML = `<div><strong>Notitie:</strong> ${toonTekst}</div>`;
    document.getElementById("marge-" + data.quoteId)?.appendChild(nieuw);

    let gekoppeldeQuote = document.getElementById(data.quoteId);
    
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

function vertelAanScreenreader(tekst) {
    document.getElementById("screenreader-feedback").innerText = tekst;
}

document.addEventListener("focusin", function(event) {
    let formulier = document.getElementById("notitie-formulier") || document.getElementById("annotatie-formulier");
    let invoerVeld = document.getElementById("input-notitie") || document.getElementById("input-annotatie");

    if (formulier && !formulier.classList.contains("verborgen") && !formulier.contains(event.target)) {
        formulier.classList.add("verborgen");
        let quoteId = formulier.dataset.gekoppeldeQuoteId;
        if (quoteId) document.getElementById(quoteId)?.classList.remove("actieve-quote");
        if (invoerVeld) invoerVeld.value = "";
    }
});