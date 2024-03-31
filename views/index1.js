// Define constant values
const IGNORE_VALUES = [null, "abc", "true", "false", true, false];
const IGNORE_HEADERS = ["host", "user-agent", "accept", "authority", "connection", /* Add more headers to ignore */];
const IGNORE_RESPONSE_VALUES = ["status", "contenttype"];
const IGNORE_REQUEST_VALUES = ["httpversion"];
const IGNORED_HOMEPAGES_REGEX = /^(?!https?:\/\/www\.).*\.com?\/$/i;

// Initialize variables
let links = [];
let nodes = [];
let caching = {};

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function () {
    // const data = await getData();
    // initializeGraph(data);
    getData().
    then(data =>  data.json()).
    then(data =>{initializeGraph(data);}).
    catch(error => {
        console.error('Error fetching data:', error);
        initializeGraph([]);
    });
});

// Event listener for button click
document.getElementById("callButton").addEventListener("click", async function () {
    const callName = document.getElementById("call-name").value;
    const filteredData = filterDataByCallName(callName);
    updateGraph(filteredData);
});

// Fetch data from server
async function getData() {
    try {
        const response = await fetch('http://localhost:3000/data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Initialize the graph with data
function initializeGraph(data) {
    nodes = getDataNodes(data);
    addMapping(data);
    updateGraph(nodes, links);
}

// Filter data based on call name
function filterDataByCallName(callName) {
    return links.filter(link => link.sourcesUrl.toLowerCase().includes(callName.toLowerCase()));
}

// Update the graph with new data
function updateGraph(nodes, links) {
    clearGraph();
    // Add logic to update the graph visualization
}

// Process raw data to extract nodes
function getDataNodes(data) {
    return data.map((call, index) => ({ id: index, label: call.url, data: call }));
}

// Clear the graph visualization
function clearGraph() {
    // Add logic to clear the graph visualization
}

// Add mapping between data elements
function addMapping(data) {
    data.forEach((call, index) => {
        processRequestHeaders(call.requestHeader, index, call.url);
        processRequestCookie(call.RequestCookie, index, call.url);
        processRequestBody(call.request, index, call.url);
        processResponseData(call.response, index, call.url);
        processResponseCookie(call.ResponseCookie, index, call.url);
        processResponseHeaders(call.responseHeader, index, call.url);
    });
}

// Process request headers
function processRequestHeaders(headers, index, url) {
    Object.keys(headers).forEach(key => {
        if (!IGNORE_HEADERS.includes(key.toLowerCase())) {
            const value = headers[key];
            // Add logic to find dependencies and update links
        }
    });
}

// Process request cookie
function processRequestCookie(cookies, index, url) {
    Object.keys(cookies).forEach(key => {
        const value = cookies[key];
        // Add logic to find dependencies and update links
    });
}

// Process request body
function processRequestBody(request, index, url) {
    // Add logic to process request body
}

// Process response data
function processResponseData(response, index, url) {
    // Add logic to process response data
}

// Process response cookie
function processResponseCookie(cookies, index, url) {
    Object.keys(cookies).forEach(key => {
        const value = cookies[key].value;
        // Add logic to find dependencies and update links
    });
}

// Process response headers
function processResponseHeaders(headers, index, url) {
    Object.keys(headers).forEach(key => {
        if (!IGNORE_HEADERS.includes(key.toLowerCase())) {
            const value = headers[key];
            // Add logic to find dependencies and update links
        }
    });
}

// Add more functions for data processing, event handling, etc.
