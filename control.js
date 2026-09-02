// get and fetch working directory
const import_Folder = document.getElementById("folder");
const iframe = document.getElementById("embed");

let parsed_html;

import_Folder.addEventListener("change", () =>
{
    if(import_Folder.files)
    {
        fetch_Folder()
    }
});

window.onload = function() {
  _init_();
}; 

async function _init_()
{
    iframe.srcdoc = "";
    iframe.removeAttribute("srcdoc");
    iframe.src = "default.html";
}




function check_html(html_text)
{
    if(!html_text)
    {
        html_text = "<!DOCTYPE HTML>\n";
    }
    
    // check for <!DOCTYPE HTML>
    if(!html_text.toLowerCase().startsWith("<!doctype html>"))
    {
        alert("Error: doctype is not specified");
        html_text = "<!DOCTYPE HTML>\n" + html_text;
    }
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html_text, "text/html");
    return document;
}

async function fetch_Folder()
{
    let html_file;
    let js_file;
    let css_file;
    
    let valid_file_amount;
    for(const file of import_Folder.files)
    {
        if(file.name.endsWith(".html"))
        {
            html_file = file;
            valid_file_amount++;
        }
        else if(file.name.endsWith(".js"))
        {
            js_file = file;
            valid_file_amount++;
        }
        else if(file.name.endsWith(".css"))
        {
            css_file = file;
            valid_file_amount++;
        }
    }
    
    if(valid_file_amount++ > 3)
    {
        alert("Warning! Too much files of type .js, .html, .css. Result may be undefined. \nPlease make sure there is exactly one of each");
    }
    
    let html_text;
    
    
    if(!js_file)
    {
        // TODO 
    }
    if(!css_file)
    {
        // TODO
    }
    if(!html_file)
    {
        html_text = 
        "<!DOCTYPE HTML>\n" +
        "<html>\n" +        
        "   <head>\n" +        
        "   </head>\n" +        
        "   <body>\n" +        
        "       Empty project. Brand new beginning :)" +        
        "   </body>\n" +        
        "</html>\n";
    }
    else
    {
        html_text = await html_file.text();
    }
    
    parsed_html = check_html(html_text);
    
    update_iframe(parsed_html)
    
}


function update_iframe(parsed_html)
{
    iframe.srcdoc = parsed_html.documentElement.outerHTML;
}

function download(type)
{
    if(!parsed_html)
    {
        console.error("Error: html file is empty. Make sure to choose directory with html file");
        return;
    }
    
    
    if(type = "html")
    {
        var a = window.document.createElement("a");
        a.style.display = 'none';
        a.href = window.URL.createObjectURL(new Blob(["<!DOCTYPE HTML>\n" + parsed_html.documentElement.outerHTML], {type: "text/html"}));
        
        a.download = "test.html";
        console.log(parsed_html);
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
    }
    else if(type = "css")
    {
        // TODO
    }
    else if(type = "js")
    {
        // TODO
    }
}