"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    let heritageSites = [];
    const modalElement = document.querySelector("#heritageSiteModal");
    const closeHeritageSiteModal = () => {
        modalElement.classList.remove("is-active");
        document.querySelector("html").classList.remove("is-clipped");
    };
    const openHeritageSiteModal = () => {
        const siteId = window.location.hash.slice(1).toLowerCase();
        closeHeritageSiteModal();
        const heritageSite = heritageSites.find((possibleHeritageSite) => {
            return possibleHeritageSite.siteId.toLowerCase() === siteId;
        });
        if (!heritageSite) {
            return;
        }
        if (heritageSite.pageName !== "") {
            modalElement.querySelector("[data-field='page']").innerHTML = "<p class=\"pt-4 has-text-centered\">" +
                "<i class=\"fas fa-3x fa-spin fa-circle-notch has-text-grey-lighter\"></i><br />" +
                "<em class=\"has-text-grey\">Loading details...</em>" +
                "</p>";
            window.fetch("pages/" + heritageSite.pageName + ".htm")
                .then((response) => {
                return response.text();
            })
                .then((pageHTML) => {
                modalElement.querySelector("[data-field='page']").innerHTML = pageHTML;
                return true;
            })
                .catch(() => {
                modalElement.querySelector("[data-field='page']").innerHTML = "";
            });
        }
        modalElement.querySelector("[data-field='civicAddress']")
            .textContent = heritageSite.civicAddress;
        modalElement.classList.add("is-active");
        document.querySelector("html").classList.add("is-clipped");
    };
    const searchResultTemplateHTML = "<div class=\"columns\">" +
        ("<div class=\"column is-7\">" +
            "<strong data-field=\"descriptionOfProperty\"></strong><br />" +
            "<span data-field=\"civicAddress\" title=\"Civic Address\"></span>" +
            "</div>") +
        ("<div class=\"column is-5\">" +
            "<span data-field=\"bylawNumber\" title=\"Bylaw Number\"></span><br />" +
            "<span data-field=\"datePassed\" title=\"Date Passed\"></span>" +
            "</div>");
    "</div>";
    const searchStringElement = document.querySelector("#searchString");
    const searchResultsElement = document.querySelector("#searchResults");
    const refreshSearchResults = () => {
        let resultCount = 0;
        const searchResultsPanelElement = document.createElement("div");
        searchResultsPanelElement.className = "panel";
        const searchString = searchStringElement.value;
        const searchStringPieces = searchString.toLowerCase().split(" ");
        const searchURL = new URL(window.location);
        if (searchString === "") {
            searchURL.search = "";
        }
        else {
            searchURL.searchParams.set("searchString", searchString);
        }
        window.history.pushState({}, "", searchURL);
        for (const heritageSite of heritageSites) {
            let includeSite = true;
            for (const searchStringPiece of searchStringPieces) {
                if (!heritageSite.searchString.includes(searchStringPiece)) {
                    includeSite = false;
                    break;
                }
            }
            if (includeSite) {
                resultCount += 1;
                const panelBlockElement = document.createElement("a");
                panelBlockElement.className = "panel-block is-block";
                panelBlockElement.href = "#" + heritageSite.siteId;
                panelBlockElement.innerHTML = searchResultTemplateHTML;
                panelBlockElement.querySelector("[data-field='descriptionOfProperty']")
                    .textContent = heritageSite.descriptionOfProperty;
                panelBlockElement.querySelector("[data-field='civicAddress']")
                    .textContent = heritageSite.civicAddress;
                panelBlockElement.querySelector("[data-field='bylawNumber']")
                    .textContent = heritageSite.bylawNumber;
                panelBlockElement.querySelector("[data-field='datePassed']")
                    .textContent = heritageSite.datePassed;
                searchResultsPanelElement.append(panelBlockElement);
            }
        }
        searchResultsElement.innerHTML = "";
        if (resultCount > 0) {
            searchResultsElement.append(searchResultsPanelElement);
        }
    };
    const loadData = () => {
        window.fetch("data/heritageSites.json")
            .then((response) => {
            return response.json();
        })
            .then((loadedHeritageSites) => {
            heritageSites = loadedHeritageSites;
            for (const heritageSite of heritageSites) {
                heritageSite.searchString = heritageSite.descriptionOfProperty.toLowerCase() + " " +
                    heritageSite.civicAddress.toLowerCase() + " " +
                    heritageSite.keywords.toLowerCase();
            }
            if (window.location.hash !== "") {
                openHeritageSiteModal();
            }
            return refreshSearchResults();
        })
            .catch(() => {
            bulmaJS.alert({
                title: "Error Loading Heritage Sites",
                message: "Please refresh this page to try again.",
                contextualColorName: "danger",
                okButton: {
                    text: "Refresh Now",
                    callbackFunction: () => {
                        window.location.reload();
                    }
                }
            });
        });
    };
    if (window.location.search !== "") {
        const searchString = new URL(window.location.href).searchParams.get("searchString");
        if (searchString) {
            searchStringElement.value = searchString;
        }
    }
    loadData();
    searchStringElement.addEventListener("keyup", refreshSearchResults);
    modalElement.querySelector(".modal-close").addEventListener("click", () => {
        closeHeritageSiteModal();
        window.location.hash = "";
    });
    window.addEventListener("hashchange", openHeritageSiteModal);
})();
