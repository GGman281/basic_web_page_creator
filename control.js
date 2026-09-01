// get and fetch working directory
const import_Folder = document.getElementById("folder");
const iframe = document.getElementById("embed");

import_Folder.addEventListener("change", () =>
    {
        if(import_Folder.files)
        {
            fetch_Folder()
        }
    });


async function fetch_Folder()
{
    let html_file;
    let js_file;
    let css_file;
    
    for(const file of import_Folder.files)
    {
        if(file.name.endsWith(".html"))
        {
            html_file = file;
        }
        else if(file.name.endsWith(".js"))
        {
            js_file = file;
        }
        else if(file.name.endsWith(".css"))
        {
            css_file = file;
        }
    }
    
    const html_text = await html_file.text();
    const js_text = await js_file.text();
    const css_text = await css_file.text();
    
    let parsed_html = check_html(html_text);
    
    update_iframe(parsed_html)
    
}


function update_iframe(parsed_html)
{
    iframe.srcdoc = parsed_html.documentElement.outerHTML;
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