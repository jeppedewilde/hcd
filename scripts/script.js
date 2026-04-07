let alleAnnotaties = [];
const annotatieSneltoets = "a";
const kolomSwitchSneltoets = " ";

// Vind bijbehorende quote id
function getQuoteId(element) {
    if (element.classList.contains("filosofie-quote")) return element.id;
    if (element.classList.contains("marge-notities")) return element.id.replace("marge-", "");
    if (element.classList.contains("annotatie-kaart")) return element.closest(".marge-notities").id.replace("marge-", "");
    return null;
}

document.addEventListener("keydown", function (event) {
    let toets = event.key.toLowerCase();
    let focus = document.activeElement;

    // Typen in tekstvak
    if (focus.tagName === "TEXTAREA") {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("opslaan-knop").click();
        }
        return;
    }

    let quoteId = getQuoteId(focus);

    if (toets === annotatieSneltoets && quoteId) {
        event.preventDefault();
        openFormulier(quoteId);
    } 
    else if (toets === kolomSwitchSneltoets && quoteId) {
        event.preventDefault();
        switchKolom(focus, quoteId);
    } 
    else if (event.key === "Tab" && (focus.classList.contains("annotatie-kaart") || focus.classList.contains("marge-notities"))) {
        event.preventDefault();
        navigeerDoorNotities(focus, event.shiftKey);
    }
});

// Functions
function openFormulier(quoteId) {
    let formulier = document.getElementById("annotatie-formulier");
    let invoerVeld = document.getElementById("input-annotatie");

    document.getElementById(quoteId).classList.add("actieve-quote");
    formulier.dataset.gekoppeldeQuoteId = quoteId;
    
    let bestaande = alleAnnotaties.find(n => n.quoteId === quoteId);
    invoerVeld.value = bestaande ? bestaande.annotatie : "";
    vertelAanScreenreader(bestaande ? "Notitie bewerken." : "Nieuwe annotatie.");

    document.getElementById("marge-" + quoteId).appendChild(formulier);
    formulier.classList.remove("verborgen");
    invoerVeld.focus();
}

function switchKolom(focus, quoteId) {
    if (focus.classList.contains("filosofie-quote")) {
        // Van tekst naar marge
        let marge = document.getElementById("marge-" + quoteId);
        let notitie = marge.querySelector(".annotatie-kaart");
        
        if (notitie) {
            notitie.focus();
            vertelAanScreenreader("Notitie gelezen.");
        } else {
            marge.setAttribute("tabindex", "-1");
            marge.focus();
            vertelAanScreenreader("Marge leeg.");
        }
    } else {
        // Van marge naar tekst
        document.getElementById(quoteId).focus();
        vertelAanScreenreader("Terug in de tekst.");
    }
}

function navigeerDoorNotities(focus, isShift) {
    let notities = Array.from(document.querySelectorAll(".annotatie-kaart"));
    if (notities.length === 0) return vertelAanScreenreader("Geen notities.");

    if (focus.classList.contains("marge-notities")) {
        return isShift ? notities[notities.length - 1].focus() : notities[0].focus();
    }

    let index = notities.indexOf(focus);
    if (isShift && index > 0) notities[index - 1].focus();
    else if (!isShift && index < notities.length - 1) notities[index + 1].focus();
    else vertelAanScreenreader(isShift ? "Dit is de eerste." : "Dit is de laatste.");
}

// Opslaan en tonen
document.getElementById("opslaan-knop").addEventListener("click", function() {
    let formulier = document.getElementById("annotatie-formulier");
    let quoteId = formulier.dataset.gekoppeldeQuoteId;
    let nieuweTekst = document.getElementById("input-annotatie").value;

    // Updaten als hij al bestond, anders nieuw toevoegen
    let bestaande = alleAnnotaties.find(n => n.quoteId === quoteId);
    if (bestaande) {
        bestaande.annotatie = nieuweTekst;
        document.querySelector(`#marge-${quoteId} .annotatie-kaart`).innerHTML = `<div><strong>Notitie:</strong> ${nieuweTekst}</div>`;
    } else {
        let nieuweNotitie = { quoteId: quoteId, annotatie: nieuweTekst };
        alleAnnotaties.push(nieuweNotitie);
        zetOpScherm(nieuweNotitie);
    }

    localStorage.setItem("roger_annotaties", JSON.stringify(alleAnnotaties));

    // Formulier sluiten en focus teruggeven
    document.getElementById("input-annotatie").value = "";
    formulier.classList.add("verborgen");
    document.getElementById(quoteId).classList.remove("actieve-quote");
    document.getElementById(quoteId).focus();
    vertelAanScreenreader("Opgeslagen.");
});

function laadAnnotaties() {
    let bewaardeData = JSON.parse(localStorage.getItem("roger_annotaties")) || [];
    alleAnnotaties = bewaardeData;
    alleAnnotaties.forEach(zetOpScherm);
}
laadAnnotaties();

function zetOpScherm(data) {
    let nieuw = document.createElement("div");
    nieuw.setAttribute("tabindex", "-1"); 
    nieuw.classList.add("annotatie-kaart");
    nieuw.innerHTML = `<div><strong>Notitie:</strong> ${data.annotatie}</div>`;
    
    document.getElementById("marge-" + data.quoteId)?.appendChild(nieuw);
}

function vertelAanScreenreader(tekst) {
    document.getElementById("screenreader-feedback").innerText = tekst;
}

// Ruim alles op als hij per ongeluk uit het formulier tabt
document.addEventListener("focusin", function(event) {
    let formulier = document.getElementById("annotatie-formulier");
    if (!formulier.classList.contains("verborgen") && !formulier.contains(event.target)) {
        formulier.classList.add("verborgen");
        let quoteId = formulier.dataset.gekoppeldeQuoteId;
        if (quoteId) document.getElementById(quoteId)?.classList.remove("actieve-quote");
        document.getElementById("input-annotatie").value = "";
    }
});