/* eslint-disable node/no-unpublished-import, node/no-unsupported-features/node-builtins */

import type { BulmaJS } from "@cityssm/bulma-js/types";
import type * as Leaflet from "leaflet";
import type { HeritageSite } from "../../src/data/types";

declare const bulmaJS: BulmaJS;
declare const L;

(() => {

  let heritageSites: HeritageSite[] = [];

  const searchStringElement = document.querySelector("#searchString") as HTMLInputElement;
  const searchResultsElement = document.querySelector("#searchResults") as HTMLElement;

  const modalElement = document.querySelector("#heritageSiteModal") as HTMLElement;
  const mapElement = document.querySelector("#heritageSiteMap") as HTMLElement;
  let map: Leaflet.Map;

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

    let focusTargetElement: HTMLElement = searchResultsElement.querySelector("a[href='" + currentHash + "']") as HTMLAnchorElement;
    if (!focusTargetElement) {
      focusTargetElement = searchStringElement;
    }

    window.location.hash = "";

    // eslint-disable-next-line promise/catch-or-return
    Promise.resolve().then(() => {
      focusTargetElement.focus();
      return;
    });
  };

  const openHeritageSiteModal = () => {

    const siteId = window.location.hash.slice(1).toLowerCase();

    // close any open modals
    closeHeritageSiteModal();

    // get heritage site
    const heritageSite = heritageSites.find((possibleHeritageSite) => {
      return possibleHeritageSite.siteId.toLowerCase() === siteId;
    });

    if (!heritageSite) {
      return;

    }
    // populate modal

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

          const pageAnchorElements = modalElement.querySelectorAll("[data-field='page'] a") as NodeListOf<HTMLAnchorElement>;

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

    } else {
      modalElement.querySelector("[data-field='page']").innerHTML = "<h1></h1>";
      modalElement.querySelector("[data-field='page'] h1").textContent = heritageSite.descriptionOfProperty;
    }

    modalElement.querySelector("[data-field='civicAddress']")
      .textContent = heritageSite.civicAddress;

    modalElement.querySelector("[data-field='legalDescription']")
      .textContent = heritageSite.legalDescription;

    modalElement.querySelector("[data-field='ownerName']")
      .textContent = heritageSite.ownerName;

    modalElement.querySelector("[data-field='ownerAddress']")
      .textContent = heritageSite.ownerAddress;

    // show modal
    modalElement.classList.add("is-active");
    document.querySelector("html").classList.add("is-clipped");
    document.querySelector("main").setAttribute("inert", "inert");
    modalElement.querySelector(".modal-card-body").scrollTop = 0;
    (modalElement.querySelector(".modal-card-title") as HTMLElement).focus();

    // build map
    if (heritageSite.latitude !== "" && heritageSite.longitude !== "") {

      const latitude = Number.parseFloat(heritageSite.latitude);
      const longitude = Number.parseFloat(heritageSite.longitude);

      mapElement.classList.remove("is-hidden");

      // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
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
        .bindPopup(heritageSite.descriptionOfProperty)
        .addTo(map);

    } else {
      mapElement.classList.add("is-hidden");
    }
  };

  const searchResultsTableInnerHTML = "<thead><tr>" +
    "<th>Description of Property</th>" +
    "<th>Bylaw Number</th>" +
    "</tr></thead>" +
    "<tbody></tbody>";

  const searchResultRowInnerHTML =
    ("<td>" +
      "<a class=\"has-text-weight-bold\" data-field=\"descriptionOfProperty\"></a><br />" +
      "<span data-field=\"civicAddress\" title=\"Civic Address\"></span>" +
      "</td>") +
    ("<td>" +
      "<span data-field=\"bylawNumber\" title=\"Bylaw Number\"></span><br />" +
      "<span data-field=\"datePassed\" title=\"Date Passed\"></span>" +
      "</td>");

  const refreshSearchResults = () => {

    let resultCount = 0;

    const searchResultsTableElement = document.createElement("table");
    searchResultsTableElement.className = "table is-fullwidth";
    searchResultsTableElement.innerHTML = searchResultsTableInnerHTML;

    const searchString = searchStringElement.value;
    const searchStringPieces = searchString.toLowerCase().split(" ");

    const searchURL = new URL(window.location as unknown as URL);

    if (searchString === "") {
      searchURL.search = "";
    } else {
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

        const descriptionOfPropertyAnchorElement = rowElement.querySelector("[data-field='descriptionOfProperty']") as HTMLAnchorElement;

        descriptionOfPropertyAnchorElement.href = "#" + heritageSite.siteId;
        descriptionOfPropertyAnchorElement.textContent = heritageSite.descriptionOfProperty;

        (rowElement.querySelector("[data-field='civicAddress']") as HTMLElement)
          .textContent = heritageSite.civicAddress;

        (rowElement.querySelector("[data-field='bylawNumber']") as HTMLElement)
          .textContent = heritageSite.bylawNumber;

        (rowElement.querySelector("[data-field='datePassed']") as HTMLElement)
          .textContent = heritageSite.datePassed;

        searchResultsTableElement.querySelector("tbody").append(rowElement);
      }
    }

    searchResultsElement.innerHTML = "";

    if (resultCount > 0) {
      searchResultsElement.append(searchResultsTableElement);
    } else {

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


  /*
   * Initialize
   */


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
