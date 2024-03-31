


var links = [];
var nodes = [];
var Caching = {};
const IGNORE_VALUES = [null, "abc", "true", "false", true, false];

const IGNORE_HEADERS = ["host", "user-agent", "accept", "authority", "connection", "accept-language", "content-type", "sec-ch-ua", "sec-ch-ua-bitness", "sec-ch-ua-full-version", "sec-ch-ua-mobile", "sec-ch-ua-model", "sec-ch-ua-platform", "sec-ch-ua-wow64", "sec-fetch-dest", "sec-fetch-site", "connection", "upgrade-insecure-requests", "sec-fetch-mode", "sec-fetch-user", "accept-encoding", "sec-ch-ua-arch", "sec-ch-ua-platform-version", "x-requested-with", "content-encoding"]; //to add header to ignore 
const IGNORE_RESPONSE_VALUES = ["status", "contenttype"];
const IGNORE_REQUEST_VALUES = ["httpversion"];
const IGNORED_HOMEPAGES_REGEX = /^(?!https?:\/\/www\.).*\.com?\/$/i;
let width;
let height
let linkslist;
let nodelist;
//   document.addEventListener("DOMContentLoaded", async function() {

// let link;
// let node;
let highlight;


var myDataElement = document.getElementById("myData");
const data = JSON.parse(myDataElement.textContent);
document.addEventListener("DOMContentLoaded", async function () {

    nodes = getDataNodes(data);
    AddMapping(data);
    const linkObject = Object.assign([], links);
    const nodeObejct = Object.assign([], nodes);
    getD3(linkObject, nodeObejct);
});


document.getElementById("callButton").addEventListener("click", async function () {

    clearTable();
    var callName = document.getElementById("call-name").value
    var filterList = links.filter(link => link.sourcesUrl.toLowerCase().includes(callName.toLowerCase()));
    var filterRoutes = nodes.filter(node => filterList.find(link => (link.source == node.id || link.target == node.id)));
    getD3(filterList, filterRoutes);
    filterList.forEach(d => createLinkTable(d));

});

function getD3(D3list, D3node) {
    linkslist = D3list.map(obj => deepCopyObject(obj));
    nodelist = D3node.map(obj => deepCopyObject(obj));
    d3.selectAll(".link").remove();
    d3.selectAll(".node").remove();

    const svg = d3.select("svg");
    width = svg.node().parentElement.clientWidth * 0.97;
    height = svg.node().parentElement.clientHeight;

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    let link = svg.selectAll(".link")
        .data(linkslist)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)")
        .on("click", handleLinkClick);

    let node = svg.selectAll(".node")
        .data(nodelist)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .call(drag(simulation))
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    node.on("click", function (event, d) {
        showNodeDetails(d);
        // highlightNode(event, d, node, link);

    })

    simulation.nodes(nodelist)
        .on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("cx", d => boundNode(d).x)
                .attr("cy", d => boundNode(d).y)
                .attr("fill", d => {
                    if (!linkslist.some(link => link.source === d || link.target === d)) {
                        return "blue";
                    } else {
                        return "red";
                    }
                });

        });

    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 12)
        .attr("refY", 3)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "#999");


    simulation.force("link").links(linkslist);
    highlight = true;

    d3.select("#toggleButton").on("click", function () {
        highlight = !highlight;
        if (highlight) {
            node.classed("highlighted", false);
            link.classed("highlighted-link", false);
        }
    });
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}

async function getData() {

    try {
        const response = await fetch('http://localhost:3000/data');
        var data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        console.error(error);
    }
}

function deepCopyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function AddMapping(data) {
    data.forEach((call, index) => {
        processRequestHeaders(call, index);
        processRequestCookies(call, index);
        processRequestBody(call, index);
        processResponseBody(call, index);
        processResponseCookies(call, index);
        processResponseHeaders(call, index);
    });
}
function processResponseHeaders(call, index) {
    Object.keys(call.responseHeader).forEach(key => {
        if (!IGNORE_HEADERS.includes(key.toLowerCase())) {
            const value = call.responseHeader[key];
            if (!Caching.hasOwnProperty(value) && !IGNORE_VALUES.includes(value)) {
                Caching[value] = [index, key, "responseHeader", call.url];
            }
        }
    });
}

function processResponseCookies(call, index) {
    Object.keys(call.ResponseCookie).forEach(key => {
        const value = call.ResponseCookie[key].value;
        if ((value !== "" || value !== '') && (!Caching.hasOwnProperty(value) && !IGNORE_VALUES.includes(value))) {
            Caching[value] = [index, key, "responseCookie", call.url];
        }

    });
}

function processResponseBody(call, index) {
    Object.keys(call.response).forEach(key => {
        if (key == "body" && call.response[key]) {
            if (call.response.contentType && (call.response.contentType.toLowerCase().includes("text/plain") || call.response.contentType.toLowerCase() == "application/x-www-form-urlencoded")) {
                try {
                    const keyValuePairs = call.response[key].split('&').map(pair => pair.split('='));
                    const obj = {};
                    keyValuePairs.forEach(([key, value]) => {
                        if (!IGNORE_RESPONSE_VALUES.includes(key.toLowerCase())) {
                            if (!Caching.hasOwnProperty(value) && !IGNORE_VALUES.includes(value)) {
                                Caching[value] = [index, key, "response", call.url];

                            }
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                }

            }
            else if (call.response.contentType && call.response.contentType.toLowerCase().includes("application/json")) {

                try {
                    if (!call.response[key].trim() == "") {
                        var str = flattenObject(JSON.parse(call.response[key]));
                        for (const cur in str) {

                            if (!Caching.hasOwnProperty(str[cur].value) && !IGNORE_VALUES.includes(str[cur].value)) {
                                Caching[str[cur].value] = [index, str[cur].key, "response", call.url];

                            }
                        }

                    }
                }
                catch (error) {
                    console.log(call.response[key]);
                    console.error(error);
                }

            }
            else {
                console.log("Unexpected Content type ");
                console.log(call.response.contentType);
            }
        }
    });
}

function processRequestBody(call, index) {
    Object.keys(call.request).forEach(key => {
        if (key == "body" && call.request[key]) {
            if (call.request.contentType && (call.request.contentType.toLowerCase().includes("text/plain") || call.request.contentType.toLowerCase() == "application/x-www-form-urlencoded")) {
                try {
                    const keyValuePairs = call.request[key].split('&').map(pair => pair.split('='));
                    const obj = {};
                    keyValuePairs.forEach(([key, value]) => {
                        if (typeof (value) == "string" && value.startsWith("Bearer ")) {
                            var valueArray = value.split(" ");
                            value = valueArray[1];
                        }
                        findDependency(value, "request", key, index, call.url);
                    });
                }
                catch (error) {
                    console.log(error);
                }

            }
            else if (call.request.contentType && call.request.contentType.toLowerCase().includes("application/json")) {

                try {
                    if (!call.request[key].trim() == "") {
                        var str = flattenObject(JSON.parse(call.request[key]));
                        for (const cur in str) {
                            if (typeof (str[cur].value) == "string" && str[cur].value.startsWith("Bearer ")) {
                                var valueArray = value.split(" ");
                                value = valueArray[1];
                            }
                            findDependency(str[cur].value, "request", str[cur].key, index, call.url);

                        }
                    }

                }
                catch (error) {
                    console.log(call.request[key]);
                    console.log(error);
                }

            }

            else {
                console.log("Unexpected Content type ");
                console.log(call);
            }

        }
        if (key == "query") {
            call.request[key].forEach((query, ind) => {
                var value = call.request[key][ind].value;
                if (typeof (value) == "string" && value.startsWith("Bearer ")) {
                    var valueArray = value.split(" ");
                    value = valueArray[1];
                }
                findDependency(value, "request", call.request[key][ind].name, index, call.url);
            });
        }

    });
}

function processRequestCookies(call, index) {
    Object.keys(call.RequestCookie).forEach(key => {
        var value = call.RequestCookie[key];
        if (typeof (call.RequestCookie[key]) == "string" && call.RequestCookie[key].startsWith("Bearer ")) {
            var valueArray = call.requestHeader[key].split(" ");
            value = valueArray[1];
        }
        findDependency(value, "RequestCookie", key, index, call.url);
    });
}

function processRequestHeaders(call, index) {
    Object.keys(call.requestHeader).forEach(key => {
        if (!IGNORE_HEADERS.includes(key.toLowerCase())) {
            var value = call.requestHeader[key];
            if (typeof (call.requestHeader[key]) == "string" && call.requestHeader[key].startsWith("Bearer ")) {
                var valueArray = call.requestHeader[key].split(" ");
                value = valueArray[1];
            }

            findDependency(value, "requestHeader", key, index, call.url);
        }
    });
}

function flattenObject(obj, parentKey = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const prefixedKey = parentKey ? `${parentKey}[${key}]` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            acc.push(...flattenObject(obj[key], prefixedKey));
        } else {
            acc.push({ key: prefixedKey, value: obj[key] });
        }
        return acc;
    }, []);
}
function getDataNodes(data) {
    var nodes = [];
    data.forEach((call, index) => {
        nodes.push({ id: index, label: call.url, data: call });
    });
    return nodes;
}

function boundNode(node) {
    node.x = Math.max(5, Math.min(width - 5, node.x));
    node.y = Math.max(5, Math.min(height - 5, node.y));
    return node;
}

function findDependency(value, sources, key, index, sourecUrl) {
    if (IGNORED_HOMEPAGES_REGEX.test(value)) {
        return;
    }
    if (Caching.hasOwnProperty(value)) {
        var responsevalue = Caching[value];
        var destination = responsevalue[0];
        if (index == destination || sourecUrl == responsevalue[3]) {
            return;
        }
        const linkToUpdate = links.find(link => link.source == index && link.target == destination);
        if (linkToUpdate) {
            if (sources == "request") {
                linkToUpdate.weight.request.push(
                    {
                        name: key,
                        value: value,
                        destinationKeyName: responsevalue[1],
                        destinationType: responsevalue[2]

                    }
                )
            }
            else if (sources == "RequestCookie") {
                linkToUpdate.weight.RequestCookie.push(
                    {
                        name: key,
                        value: value,
                        destinationKeyName: responsevalue[1],
                        destinationType: responsevalue[2]

                    }
                )
            }
            else {
                linkToUpdate.weight.requestHeader.push(
                    {
                        name: key,
                        value: value,
                        destinationKeyName: responsevalue[1],
                        destinationType: responsevalue[2]

                    }
                )
            }

        }
        else {
            const weight = { request: [], requestHeader: [], RequestCookie: [] };
            if (sources == "request") {
                weight.request.push(
                    {
                        name: key,
                        value: value,
                        destinationKeyName: responsevalue[1],
                        destinationType: responsevalue[2]

                    }
                )
            }
            else if (sources == "RequestCookie") {
                weight.RequestCookie.push(
                    {
                        name: key,
                        value: value,
                        destinationKeyName: responsevalue[1],
                        destinationType: responsevalue[2]

                    }
                )
            }
            else {
                weight.requestHeader.push(
                    {
                        name: key,
                        value: value,
                        destinationKeyName: responsevalue[1],
                        destinationType: responsevalue[2]

                    }
                )
            }
            links.push({ source: index, target: destination, sourcesUrl: sourecUrl, destinationUrl: responsevalue[3], weight: weight });
        }

    }
    else {
        if (!IGNORE_VALUES.includes(value)) {
            Caching[value] = [index, key, sources, sourecUrl];
        }

    }
}

function highlightNode(event, d, node, link) {
    if (highlight) {
        const selectedNode = d;

        node.classed("highlighted", function (n) {
            return n === selectedNode;
        });
        node.classed("hiddenNodes", function (n) {
            return n !== selectedNode;
        });
        link.classed("highlighted-link", function (l) {
            return l.source === selectedNode || l.target === selectedNode;
        });
        link.classed("hiddenNodes", function (l) {
            return l.source !== selectedNode && l.target !== selectedNode;
        });
    }
}

function handleLinkClick(event, d) {
    createLinkTable(d);
}

function createLinkTable(d) {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.display = 'block';
    const tableBody = sidebar.querySelector('#edgeDetails tbody');


    const row = tableBody.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();

    cell1.textContent = d.source?.data?.url ?? d.sourcesUrl;
    cell2.textContent = d.target?.data?.url ?? d.destinationUrl;
    cell3.textContent = JSON.stringify(d.weight, null, 4);

    cell1.style.border = '1px solid black';
    cell2.style.border = '1px solid black';
    cell3.style.border = '1px solid black';

    cell1.style.width = '200px'; 
    cell2.style.width = '200px'; 
    // cell3.style.width = '300px'; 


    // Set overflow to auto to enable overflow when content exceeds cell dimensions
    // cell1.style.overflow = 'true';
    // cell2.style.overflow = 'true';
    // cell3.style.overflow = 'true';
}

function handleMouseOut() {
    d3.select("#tooltip").style("visibility", "hidden");
}
function handleMouseOver(event, d) {
    const tooltip = d3.select("#tooltip");
    const jsonData = d.label;
    tooltip.style("visibility", "visible")
        .style("left", (event.pageX - 4 ) + "px")
        .style("top", (event.pageY - 3 ) + "px")
        .html(`${jsonData}`);
}
function clearTable() {
    const sidebar = document.getElementById('sidebar');
    const tableBody = sidebar.querySelector('#edgeDetails tbody');

    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

function showNodeDetails(node) {
    const nodeData = JSON.stringify(node.data, null, 4); 
    document.getElementById("additionalData").innerText = nodeData;
}