// Define a function to extract tokens and values from HTML string
function extractTokensAndValuesFromHTML(htmlString) {
    // Initialize an empty array to store objects
    let objects = [];

    // Create a temporary div element
    let tempDiv = document.createElement('div');

    // Set the innerHTML of the div to the provided HTML string
    tempDiv.innerHTML = htmlString;

    // Select all elements that have a name, id, or class attribute
    let elements = tempDiv.querySelectorAll('[name], [id], [class]');

    // Loop through each element
    elements.forEach(element => {
        // Create an object to store token and value
        let obj = {};

        // Check if the element has a name attribute
        if (element.hasAttribute('name')) {
            obj.token = 'name';
            obj.value = element.getAttribute('name');
            ExtractTagValues(element,obj);
        }
        // If name attribute is not found, check for id attribute
        else if (element.hasAttribute('id')) {
            obj.token = 'id';
            obj.value = element.getAttribute('id');
            ExtractTagValues(element,obj);
        }
        // If id attribute is not found, check for class attribute
        else if (element.hasAttribute('class')) {
            obj.token = 'class';
            obj.value = element.getAttribute('class');
            obj.tag ={};
            ExtractTagValues(element,obj);
        }

        // Push the object into the array
        objects.push(obj);

        
    });

    return objects;
}
function ExtractTagValues(element,obj) {
   var tagName = element.tagName.toLowerCase();
   obj.tag ={};
    // Get all attributes of the element
    let attributes = element.attributes;

    // Loop through each attribute
    for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        // Store the attribute name and value in the object
        obj["tag"][tagName +"~~@attributeName~~"+attribute.name] = attribute.value;
    }
}
// Sample HTML string
let htmlResponse = `
    <div id="main" role="main">
        <div id="ads-plugin">
            <!-- Your HTML content goes here -->
        </div>
    </div>
`;

// Call the function with the HTML string and store the result
let tokenValueList = extr
