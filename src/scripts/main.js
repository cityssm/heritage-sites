"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    let heritageSites = [];
    const searchStringElement = document.querySelector("#searchString");
    const searchResultsElement = document.querySelector("#searchResults");
    const modalElement = document.querySelector("#heritageSiteModal");
    const mapElement = document.querySelector("#heritageSiteMap");
    let map;
    const closeHeritageSiteModal = () => {
        if (map) {
            map.remove();
            map = undefined;
            mapElement.innerHTML = "";
        }
        modalElement.classList.remove("is-active");
        document.querySelector("html").classList.remove("is-clipped");
        document.querySelector("main").removeAttribute("inert");
    };
    const closeHeritageSiteModalAndClearHash = () => {
        closeHeritageSiteModal();
        const currentHash = window.location.hash;
        let focusTargetElement = searchResultsElement.querySelector("a[href='" + currentHash + "']");
        if (!focusTargetElement) {
            focusTargetElement = searchStringElement;
        }
        window.location.hash = "";
        Promise.resolve().then(() => {
            focusTargetElement.focus();
            return;
        });
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
        if (heritageSite.hasPage === "TRUE") {
            modalElement.querySelector("[data-field='page']").innerHTML = "<p class=\"pt-4 has-text-centered\">" +
                "<i class=\"fas fa-3x fa-spin fa-circle-notch has-text-grey-lighter\"></i><br />" +
                "<em class=\"has-text-grey\">Loading details...</em>" +
                "</p>";
            window.fetch("pages/" + heritageSite.siteId + ".htm")
                .then((response) => {
                return response.text();
            })
                .then((pageHTML) => {
                modalElement.querySelector("[data-field='page']").innerHTML = pageHTML;
                const pageAnchorElements = modalElement.querySelectorAll("[data-field='page'] a");
                if (pageAnchorElements && pageAnchorElements.length > 0) {
                    for (const anchorElement of pageAnchorElements) {
                        anchorElement.target = "_blank";
                    }
                }
                return true;
            })
                .catch(() => {
                modalElement.querySelector("[data-field='page']").innerHTML = "";
            });
        }
        else {
            modalElement.querySelector("[data-field='page']").innerHTML = "<h1></h1>";
            modalElement.querySelector("[data-field='page'] h1").textContent = heritageSite.descriptionOfSite;
        }
        modalElement.querySelector("[data-field='civicAddress']")
            .textContent = heritageSite.civicAddress;
        modalElement.querySelector("[data-field='legalDescription']")
            .textContent = heritageSite.legalDescription;
        modalElement.querySelector("[data-field='ownerName']")
            .textContent = heritageSite.ownerName;
        modalElement.querySelector("[data-field='ownerAddress']")
            .textContent = heritageSite.ownerAddress;
        modalElement.classList.add("is-active");
        document.querySelector("html").classList.add("is-clipped");
        document.querySelector("main").setAttribute("inert", "inert");
        modalElement.querySelector(".modal-card-body").scrollTop = 0;
        modalElement.querySelector(".modal-card-title").focus();
        if (heritageSite.latitude !== "" && heritageSite.longitude !== "") {
            const latitude = Number.parseFloat(heritageSite.latitude);
            const longitude = Number.parseFloat(heritageSite.longitude);
            mapElement.classList.remove("is-hidden");
            map = L.map(mapElement, {
                center: [latitude, longitude],
                zoom: 16,
                scrollWheelZoom: false
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; <a href=\"https://openstreetmap.org/copyright\">OpenStreetMap contributors</a>"
            }).addTo(map);
            L.marker({ lon: longitude, lat: latitude })
                .bindPopup(heritageSite.descriptionOfSite)
                .addTo(map);
        }
        else {
            mapElement.classList.add("is-hidden");
        }
    };
    const searchResultsTableInnerHTML = "<thead><tr>" +
        "<th>Description of Site</th>" +
        "<th>Bylaw Number</th>" +
        "<th>Site Type</th>" +
        "</tr></thead>" +
        "<tbody></tbody>";
    const searchResultRowInnerHTML = ("<td>" +
        "<a class=\"has-text-weight-bold\" data-field=\"descriptionOfSite\"></a><br />" +
        "<span data-field=\"civicAddress\" title=\"Civic Address\"></span>" +
        "</td>") +
        ("<td>" +
            "<span data-field=\"bylawNumber\" title=\"Bylaw Number\"></span><br />" +
            "<span data-field=\"datePassed\" title=\"Date Passed\"></span>" +
            "</td>") +
        "<td data-field=\"siteType\"></td>";
    const refreshSearchResults = () => {
        let resultCount = 0;
        const searchResultsTableElement = document.createElement("table");
        searchResultsTableElement.className = "table is-fullwidth";
        searchResultsTableElement.innerHTML = searchResultsTableInnerHTML;
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
                const rowElement = document.createElement("tr");
                rowElement.innerHTML = searchResultRowInnerHTML;
                const descriptionOfSiteAnchorElement = rowElement.querySelector("[data-field='descriptionOfSite']");
                descriptionOfSiteAnchorElement.href = "#" + heritageSite.siteId;
                descriptionOfSiteAnchorElement.textContent = heritageSite.descriptionOfSite;
                rowElement.querySelector("[data-field='civicAddress']")
                    .textContent = heritageSite.civicAddress;
                rowElement.querySelector("[data-field='bylawNumber']")
                    .textContent = heritageSite.bylawNumber;
                rowElement.querySelector("[data-field='datePassed']")
                    .textContent = heritageSite.datePassed;
                rowElement.querySelector("[data-field='siteType']")
                    .textContent = heritageSite.siteType;
                searchResultsTableElement.querySelector("tbody").append(rowElement);
            }
        }
        searchResultsElement.innerHTML = "";
        if (resultCount > 0) {
            searchResultsElement.append(searchResultsTableElement);
        }
        else {
            searchResultsElement.innerHTML = "<div class=\"message is-info\">" +
                "<p class=\"message-body\">No heritage sites have been found using the above search criteria.</p>" +
                "</div>";
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
                heritageSite.searchString = heritageSite.descriptionOfSite.toLowerCase() + " " +
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
    modalElement.querySelector("#modal-button--close").addEventListener("click", closeHeritageSiteModalAndClearHash);
    document.addEventListener("keydown", (keyboardEvent) => {
        if (modalElement.classList.contains("is-active") && keyboardEvent.key === "Escape") {
            closeHeritageSiteModalAndClearHash();
        }
    });
    window.addEventListener("hashchange", openHeritageSiteModal);
})();
