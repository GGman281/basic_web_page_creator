// get and fetch working directory
const importFolder = document.getElementById("folder");
importFolder.addEventListener("change", () =>
    {
        if(importFolder.files)
        {
            fetchFolder()
        }
    });


async function fetchFolder()
{
    let html_file;
    let js_file;
    let css_file;
    
    const iframe = document.getElementById("embed")
    
    
    for(const file of importFolder.files)
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
    console.log(parsed_html);
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