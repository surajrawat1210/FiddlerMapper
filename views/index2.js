


var links = [];
var nodes = [];
var Caching = {};
const IgnoreValue = [null, "abc", "true", "false", true, false];

const IgnoreList = ["host", "user-agent", "accept", "authority", "connection", "accept-language", "content-type", "sec-ch-ua", "sec-ch-ua-bitness", "sec-ch-ua-full-version", "sec-ch-ua-mobile", "sec-ch-ua-model", "sec-ch-ua-platform", "sec-ch-ua-wow64", "sec-fetch-dest", "sec-fetch-site", "connection", "upgrade-insecure-requests", "sec-fetch-mode", "sec-fetch-user", "accept-encoding", "sec-ch-ua-arch", "sec-ch-ua-platform-version", "x-requested-with", "content-encoding"]; //to add header to ignore 
const IgnoreResponseValue = ["status", "contenttype"];
const IgnoreRequestValue = ["httpversion"];
const ignoredHomepagesRegex = /^(?!https?:\/\/www\.).*\.com?\/$/i;
let width;
let height
let linkslist;
let nodelist;
//   document.addEventListener("DOMContentLoaded", async function() {

// let link;
// let node;
let highlight;


var button = document.getElementById("callButton");
var myDataElement = document.getElementById("myData");
const data = JSON.parse(myDataElement.textContent);

console.log(myData);
//   document.addEventListener("DOMContentLoaded", async function() {
document.addEventListener("DOMContentLoaded", async function () {

        console.log(data);
        // data = await getData();
        nodes = getDataNodes(data);

        console.log(nodes);

        AddMapping(data);
    

    // var callName = document.getElementById("call-name").value
    // var callName = "paypal/redirect";
    // console.log(callName);
    // links = links.filter(link =>link.sourcesUrl.includes(callName));
    // // nodes =nodes.filter(node =>links.find(link =>(link.source ==node.id || link.target == node.id)));
    const linkObject = Object.assign([], links);
    const nodeObejct  = Object.assign([], nodes);


    getD3(linkObject,nodeObejct);
 });


button.addEventListener("click", async function () {

   clearTable();
    // links =[];
    // nodes =[] ;  
    // Caching ={};
    
    // // data = await getData();
    // nodes = getDataNodes(data);
    // console.log(nodes);
    // AddMapping(data);

    var callName = document.getElementById("call-name").value
    console.log(callName);
    var filterList = links.filter(link =>link.sourcesUrl.toLowerCase().includes(callName.toLowerCase()));
    var filterRoutes= nodes.filter(node => filterList.find(link => (link.source == node.id || link.target == node.id)));

    getD3(filterList,filterRoutes);
    filterList.forEach(d =>createLinkTable(d));




});

function getD3(D3list,D3node) {
    linkslist =  D3list.map(obj => deepCopyObject(obj));
    nodelist = D3node.map(obj => deepCopyObject(obj));
    d3.selectAll(".link").remove();
    d3.selectAll(".node").remove();

    const svg = d3.select("svg");
     width = svg.node().parentElement.clientWidth *0.97; // 70% of the container width
     height = svg.node().parentElement.clientHeight; // 100% of the container height
    
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
        .on("mouseout", handleMouseOut); // Add click event listener


        node.on("click", function(event, d) {
            showNodeDetails(d);
            highlightNode(event, d, node, link);
           
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
                        return "blue"; // Change color to blue for nodes with no links
                    } else {
                        return "red"; // Default color for nodes with links
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
        const response = await fetch('http://localhost:3000/data'); // Adjust URL as neede
        var data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        console.error(error);
    }
}
function deepCopyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function AddMapping(data) {
    data.forEach((call, index) => {

        // if (call.url.includes("https://nativeapps.ryanair.com/api/v4/en-GB/Calendar") || call.url.includes("paypal/redirect") || call.url.includes("en-GB/CurrencyConverter") || call.url.includes("customers/419rtw9901w7/profile") || call.url.includes("/en-GB/Flight") || call.url.includes("v2/mobile/message")) {
        //     console.log(call);
        // }
        Object.keys(call.requestHeader).forEach(key => {
            if (!IgnoreList.includes(key.toLowerCase())) {
                var value = call.requestHeader[key];
                if (typeof(call.requestHeader[key]) == "string" && call.requestHeader[key].startsWith("Bearer ")) {
                    var valueArray = call.requestHeader[key].split(" ");
                    value = valueArray[1];
                }

                findDependency1(value, "requestHeader", key, index, call.url);
            }
        });
            
        Object.keys(call.RequestCookie).forEach(key => {
            var value = call.RequestCookie[key];
            if(typeof(call.RequestCookie[key]) == "string" && call.RequestCookie[key].startsWith("Bearer "))
            {
                var valueArray = call.requestHeader[key].split(" ");
                value = valueArray[1];
            }
            findDependency1(value, "RequestCookie", key, index, call.url);
        });
        Object.keys(call.request).forEach(key => {
            if(call.url.includes("https://nativeapps.ryanair.com/basket/api/en-IE/partialState"))
            {
                console.log("mila");
            }
            if (key == "body" && call.request[key]) {
                if (call.request.contentType && (call.request.contentType.toLowerCase().includes("text/plain") || call.request.contentType.toLowerCase() == "application/x-www-form-urlencoded")) {
                    try {
                        const keyValuePairs = call.request[key].split('&').map(pair => pair.split('='));
                        const obj = {};
                        keyValuePairs.forEach(([key, value]) => {  
                        if(typeof(value) == "string" && value.startsWith("Bearer "))
                        {
                                var valueArray = value.split(" ");
                                value = valueArray[1];
                        }
                        findDependency1(value, "request", key, index, call.url);
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
                            console.log(str);
                            for (const cur in str) {
                                if(typeof(str[cur].value) == "string" && str[cur].value.startsWith("Bearer "))
                                {
                                        var valueArray = value.split(" ");
                                        value = valueArray[1];
                                }
                                findDependency1(str[cur].value, "request", str[cur].key, index, call.url);
                            
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
                    if(typeof(value) == "string" && value.startsWith("Bearer "))
                    {
                            var valueArray = value.split(" ");
                            value = valueArray[1];
                    }
                    findDependency1(value, "request", call.request[key][ind].name, index, call.url);
                });
            }

        });

        Object.keys(call.response).forEach(key => {
            if (key == "body" && call.response[key]) {
                if (call.response.contentType && (call.response.contentType.toLowerCase().includes("text/plain") || call.response.contentType.toLowerCase() == "application/x-www-form-urlencoded")) {
                    try {
                        const keyValuePairs = call.response[key].split('&').map(pair => pair.split('='));
                        const obj = {};
                        keyValuePairs.forEach(([key, value]) => {
                            if (!IgnoreResponseValue.includes(key.toLowerCase())) {
                                // const value = call.response[key];
                                if (!Caching.hasOwnProperty(value) && !IgnoreValue.includes(value)) {
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
                            console.log(str);
                            for (const cur in str) {

                                if (!Caching.hasOwnProperty(str[cur].value) && !IgnoreValue.includes(str[cur].value)) {
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


        Object.keys(call.ResponseCookie).forEach(key => {
            const value = call.ResponseCookie[key].value;
            if ((value !== "" || value !== '') && (!Caching.hasOwnProperty(value) && !IgnoreValue.includes(value))) {
                Caching[value] = [index, key, "responseCookie", call.url];
            }

        });
        Object.keys(call.responseHeader).forEach(key => {
            if (!IgnoreList.includes(key.toLowerCase())) {
                const value = call.responseHeader[key];
                if(call.url.includes("https://nativeapps.ryanair.com/basket/api/en-IE/partialState"))
                {
                    console.log("encounter");
                    console.log(Caching);
                    console.log(call);
                }
                if (!Caching.hasOwnProperty(value) && !IgnoreValue.includes(value)) {
                    Caching[value] = [index, key, "responseHeader", call.url];
                }
            }
        });
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

function findDependency1(value, sources, key, index, sourecUrl) {
    //check in caching 
    if (ignoredHomepagesRegex.test(value)) {
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
        if (!IgnoreValue.includes(value)) {
            Caching[value] = [index, key, sources, sourecUrl];
        }

    }
}

function highlightNode(event, d,node,link) {
    if (highlight) {
        const selectedNode = d;

        node.classed("highlighted", function (n) {
            return n === selectedNode;
        });
        node.classed("hiddenNodes",function(n){
            return n !== selectedNode;
        });
        console.log(d);
        link.classed("highlighted-link", function (l) {
            return l.source === selectedNode || l.target === selectedNode;
        });
        link.classed("hiddenNodes", function (l) {
            return l.source !== selectedNode && l.target !== selectedNode;
        });
    }
}

// function highlightNode(event, d, node, link) {
//     const selectedNode = d;
//    console.log(d);
//     if(d.classList.contains("highlighted"))
//     {
//         d.classList.remove("highlighted");
//     }
    

//    if(isHighlighted && isHighlighted)
//    {
//     node.classed("highlighted", !isHighlighted);
//     node.classed("hiddenNodes", isHighlighted);
//    }
 
//    else
//    {
//     // Toggle the highlighted-link class for the links connected to the selected node
//     node.classed("highlighted", function (n) {
//                     return n === selectedNode;
//         });
//             node.classed("hiddenNodes",function(n){
//                     return n !== selectedNode;
//         });
//             console.log(d);
//             link.classed("highlighted-link", function (l) {
//                     return l.source === selectedNode || l.target === selectedNode;
//         });
//             link.classed("hiddenNodes", function (l) {
//                 return l.source !== selectedNode && l.target !== selectedNode;
//              });
//     }
// }
// function hasClass(node, className) {
//     // Check if the node exists and has the specified class
//     return node && node.classList.contains(className);
// }

// Example usage:

function handleLinkClick(event, d) {

    createLinkTable(d);


    // Sample JSON data

}

function createLinkTable(d) {
    console.log(d);
    // console.log("Source:", d.source.data.url, "Destination:", d.target.data.url, "Weight:", JSON.stringify(d.weight));
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

    // Add borders to cells using CSS
    cell1.style.border = '1px solid black';
    cell2.style.border = '1px solid black';
    cell3.style.border = '1px solid black';

    cell1.style.width = '200px'; // Adjust the width as needed
    cell2.style.width = '200px'; // Adjust the width as needed
    cell3.style.width = '300px'; // Adjust the width as needed


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
    // const jsonData = JSON.stringify(d.data, null, 2); //on hover to show data
    const jsonData = d.label;
    tooltip.style("visibility", "visible")
        .style("left", (event.pageX + 3) + "px")
        .style("top", (event.pageY - 3) + "px")
        .html(`<pre>${jsonData}</pre>`);
}
function clearTable() {
    // Get the table body element
    const sidebar = document.getElementById('sidebar');
    const tableBody = sidebar.querySelector('#edgeDetails tbody');

    // Remove all rows from the tbody
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

function showNodeDetails(node) {
    const nodeData = JSON.stringify(node.data, null, 4); // Convert node data to JSON format

    // Display node data in the div
    document.getElementById("additionalData").innerText = nodeData;
}