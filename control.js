const import_Folder = document.getElementById("folder");
const iframe = document.getElementById("embed");
let parsed_html;

import_Folder.addEventListener("change", () =>
{
    fetch_Folder()
});

window.onload = function() {
  _init_();
}; 

function _init_()
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

let html_file;
let js_file;
let css_file;
async function fetch_Folder()
{
    html_file = undefined;
    js_file = undefined;
    css_file = undefined;
    let duplicates = false;
    
    for(const file of import_Folder.files)
    {
        if(file.name.endsWith(".html"))
        {
            if(html_file)
            {
                duplicates = true;
            }
            html_file = file;
        }
        else if(file.name.endsWith(".css"))
        {
            if(css_file)
            {
                duplicates = true;
            }
            css_file = file;
        }
        else if(file.name.endsWith(".js"))
        {
            if(js_file)
            {
                duplicates = true;
            }
            js_file = file;
        }
    }
    
    if(duplicates)
    {
        alert("Warning! Too much files of type .js, .html or .css. Result may be undefined. \nPlease make sure there is exactly one of each");
        return;
    }
    
    let html_text;
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
    
    if(js_file)
    {
        // check if javascript file is connected
        if(is_file_connected_property(js_file.name, parsed_html.scripts, "src"))
        {
            change_html_file_path(parsed_html.scripts, "src",  js_file.name, js_file.webkitRelativePath);
        }
        else
        {
            console.log("Script is not connected");
        }
    }
    
    if(css_file)
    {
        // check if stylesheet file is connected
        if(is_file_connected_property(css_file.name, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href"))
        {
            change_html_file_path(parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", css_file.name, css_file.webkitRelativePath);
        }
        else
        {
            console.log("Stylesheet is not connected");
        }
    }
    
    update_element_menu();
    update_iframe();
}

function update_element_menu()
{
    let element_list_node = document.getElementById("element_list");
    element_list_node.innerHTML = "";
    
    const head_li = document.createElement("li");
    head_li.textContent = "html"
    element_list_node.appendChild(head_li);
    
    const head_ul = document.createElement("ul");
    element_list_node.appendChild(head_ul);
    print_element_menu(parsed_html.head, head_ul);
    
    
    const body_li = document.createElement("li");
    body_li.textContent = "body"
    element_list_node.appendChild(body_li);
    
    const body_ul = document.createElement("ul");
    element_list_node.appendChild(body_ul);
    print_element_menu(parsed_html.body, body_ul);
    
}

function print_element_menu(from, element_list_node)
{
    for(const element of from.children)
    {
        const li = document.createElement("li");
        li.textContent = element.tagName.toLowerCase();
        element_list_node.appendChild(li);
        if(element.children.length > 0)
        {
            const ul = document.createElement("ul");
            print_element_menu(element, ul);
            element_list_node.appendChild(ul);
        }
    }
}

function change_html_file_path(array_of_files, property, from, to)
{    
    for(let i = 0; i < array_of_files.length; i++)
    {
        if(array_of_files[i][property].endsWith(from))
        {
            array_of_files[i][property] = to;
        }
    }
}

function is_file_connected_property(file_name, array_of_files, property)
{
    if(!file_name)
    {
        return false;
    }
    
    for(const file of array_of_files)
    {
        if(file[property].endsWith(file_name))
        {
            return true;
        }
    }
    return false;
}

function update_iframe()
{
    iframe.srcdoc = parsed_html.documentElement.outerHTML;
    iframe.removeAttribute("src");
}

function prompt_name()
{
    let name = prompt("Put file name here: ");
    if(name === null || name.length === 0)
    {
        let repeat = confirm("Warning: input field is empty or user cancelled. \nConfirm to repeat the process");
        while(repeat && (name === null || name.length === 0))
        {
            name = prompt("Put file name here: ");
        }
    }
    return name;
}

function export_file(file, blob, extension)
{
    const a = document.createElement("a");
    a.style.display = 'none';        
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    
    let filename = prompt_name();
    if(filename === null || filename.length === 0)
    {
        a.download = file?.name || "index" + extension;
    }
    else
    {
        a.download = filename + extension;
    } 
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function download(type)
{
    if(!parsed_html)
    {
        console.error("Error: html file is empty. Make sure to choose directory with html file");
        return;
    }
    
    
    if(type === "html")
    {
        change_html_file_path(parsed_html.scripts, "src", js_file.webkitRelativePath,  js_file.name);
        change_html_file_path(parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", css_file.webkitRelativePath, css_file.name);
        
        const blob = new Blob(["<!DOCTYPE HTML>\n" + parsed_html.documentElement.outerHTML], {type: "text/html"});
        export_file(html_file, blob, ".html");
        
        change_html_file_path(parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", css_file.name, css_file.webkitRelativePath);
        change_html_file_path(parsed_html.scripts, "src",  js_file.name, js_file.webkitRelativePath);
        update_iframe();
    }
    else if(type === "css")
    { 
        if(!css_file)
        {
            console.error("Couldn't find css file");
            return;
        }
        
        const blob = new Blob([css_file], {type: "text/css"});
        export_file(css_file, blob, ".css");
    }
    else if(type === "js")
    {
        if(!js_file)
        {
            console.error("Couldn't find js file");
            return;
        }
        
        const blob = new Blob([js_file], {type: "text/javascript"});
        export_file(js_file, blob, ".js");
    }
}