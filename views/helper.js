const IgnoreUrls = [".png",".jpg",".css",".js",".gif"];
var CallListMap ={};
export const  processNetworkData = (data) =>{
    // Your conversion logic here
    data = JSON.parse(data);
    
    const convertedData = data.log.entries.map(entry => {
        console.log("hello");
        if(isUrlValid(entry.request.url))
        {
        var callNumber =1;
        if(CallListMap.hasOwnProperty(entry.request.url))
        {
            callNumber =CallListMap[entry.request.url]+1;
            CallListMap[entry.request.url]+=1;
            console.log("repeated Url "+entry.request.url +"count is "+callNumber);

        }
        else
        {
            CallListMap[entry.request.url]=1;
        }
        return {
            "url": entry.request.url,
            "callNumber":callNumber,
            "requestHeader": convertHeadersToLowercase(entry.request.headers),
            "responseHeader": convertHeadersToLowercase(entry.response.headers),
            "request": {
                "query": entry.request.queryString,
                "body": entry.request.postData ? entry.request.postData.text : null,
                "contentType": entry.request.postData ? entry.request.postData.mimeType : null,
                "httpVersion": entry.request.httpVersion
            },
            "response": {
                "status": entry.response.status,
                "body": entry.response.content.text ? entry.response.content.text : null,
                "contentType": entry.response.content ? entry.response.content.mimeType : null
            },
            "RequestCookie": entry.request.cookies,
            "ResponseCookie": entry.response.cookies
        };
    }  
    else {
        return null; 
    }
}).filter(entry => entry !== null); 

return convertedData;
}


function isUrlValid(url) {
   
   var urlWithParams = url.split("?")[0];
    // Check if the URL does not include any of the ignored extensions
    return IgnoreUrls.every(extension => !urlWithParams.includes(extension));
}

function convertHeadersToLowercase(headers) {
    const convertedHeaders = {};
    headers.forEach(header => {
        convertedHeaders[header.name.toLowerCase()] = header.value;
    });
    return convertedHeaders;
}
