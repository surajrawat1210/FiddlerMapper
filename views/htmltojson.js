// function convertToJSON() {
//     var htmlText = document.getElementById("htmlTextarea").value;
//     var jsonText = htmlToJson(htmlText);
//     document.getElementById("jsonTextarea").value = JSON.stringify(jsonText, null, 2);
// }

function htmlToJson(htmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlText, 'text/html');
    return elementToJson(doc.documentElement);
}

function elementToJson(element) {
    var json = {
        tagName: element.tagName.toLowerCase(),
        content: [],
        attributes: {}
    };

    // Extract attributes
    var attrs = element.attributes;
    for (var i = 0; i < attrs.length; i++) {
        var attrName = attrs[i].name;
        var attrValue = attrs[i].value;
        if (attrName === 'src') {
                
                if (attrValue.includes('?')) {
                var url = attrValue.split('?')[1];
                var params = url.split('&');
                var queryparams ={};
                params.forEach(param => {
                    var keyValue = param.split('=');
                    var key = keyValue[0];
                    var value = decodeURIComponent(keyValue[1]);
                    queryparams[key] = value;
                });
                json.attributes["decodedSrc"] = queryparams;
                json.attributes[attrName] = attrValue;
            }

        }
        // If the attribute value contains multiple key-value pairs separated by whitespace,
        // split it and include each pair in the attributes object
        if (attrValue.includes(' ')) {
            var keyValuePairs = attrValue.split(' ');
            keyValuePairs.forEach(pair => {
                var pairArr = pair.split('=');
                var key = pairArr[0];
               
                if(pairArr[1]!=undefined)
                {
                    var value = pairArr[1].replace(/"/g, ''); // Remove double quotes from value
                    json.attributes[key] = value;
                }
                
            });
        } else {
            json.attributes[attrName] = attrValue;
        }
    }

    // Extract child nodes
    if (element.childNodes.length > 0) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var child = element.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() != "") {
                json.content.push(child.textContent.trim());
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                json.content.push(elementToJson(child));
            }
        }
    }

    return json;
}