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



let html_file;
let js_file;
let css_file;
async function fetch_Folder()
{
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
        if(is_js_in_html(js_file.name))
        {
            fix_displayable_html_scripts();
        }
        else
        {
            console.log("Script is not connected");
        }
    }
    
    
    if(css_file)
    {
        // check if stylesheet file is connected
        if(is_css_in_html(css_file.name))
        {
            fix_displayable_html_stylesheet();
        }
        else
        {
            console.log("Script is not connected");
        }
    }
    
    update_element_menu();
    update_iframe();
}

function update_element_menu()
{
    let element_list_node = document.getElementById("element_list");
    
    
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

function fix_displayable_html_scripts()
{
    if(!js_file)
    {
        return;
    }
    const scripts = parsed_html.scripts;
    if(scripts)
    {
        for(let i = 0; i < scripts.length; i++)
        {
            if(scripts[i].src.endsWith(js_file.name))
            {
                parsed_html.scripts[i].src = js_file.webkitRelativePath;
            }
        }
    }
}

function clean_script_path()
{
    if(!js_file)
    {
        return;
    }
    
    const scripts = parsed_html.scripts;
    if(scripts)
    {
        for(let i = 0; i < scripts.length; i++)
        {
            if(scripts[i].src.endsWith(js_file.webkitRelativePath))
            {
                parsed_html.scripts[i].src = js_file.name;
            }
        }
    }
}


function clean_stylesheet_path()
{
    if(!css_file)
    {
        return;
    }
    
    const stylesheets = parsed_html.querySelectorAll('link[rel="stylesheet"]');
    if(stylesheets)
    {
        for(let i = 0; i < stylesheets.length; i++)
        {
            if(stylesheets[i].href.endsWith(css_file.webkitRelativePath))
            {
                stylesheets[i].href = css_file.name;
            }
        }
    }
}

function is_js_in_html(js_file_name)
{
    if(!js_file_name)
    {
        return;
    }
    const scripts = parsed_html.scripts;
    if(scripts)
    {
        for(const script of scripts)
        {
            if(script.src.endsWith(js_file_name) )
            {
                return true;
            }
        }
    }
    return false;
}

function fix_displayable_html_stylesheet()
{
    if(!css_file)
    {
        return;
    }
    const stylesheets = parsed_html.querySelectorAll('link[rel="stylesheet"]');
    if(stylesheets)
    {
        for(let i = 0; i < stylesheets.length; i++)
        {
            if(stylesheets[i].href.endsWith(css_file.name))
            {
                stylesheets[i].href = css_file.webkitRelativePath;
            }
        }
    }
}

function is_css_in_html(css_file_name)
{
    if(!css_file_name)
    {
        return;
    }
    const stylesheets = parsed_html.querySelectorAll('link[rel="stylesheet"]');
    if(stylesheets)
    {
        for(const stylesheet of stylesheets)
        {
            if(stylesheet.href.endsWith(css_file_name) )
            {
                return true;
            }
        }
    }
    return false;
}

function update_iframe()
{
    iframe.srcdoc = parsed_html.documentElement.outerHTML;
    iframe.src = "";
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
        var a = window.document.createElement("a");
        a.style.display = 'none';
        
        clean_script_path();
        clean_stylesheet_path();
        a.href = window.URL.createObjectURL(new Blob(["<!DOCTYPE HTML>\n" + parsed_html.documentElement.outerHTML], {type: "text/html"}));
        fix_displayable_html_scripts();
        
        a.download = html_file.name;
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
    }
    else if(type === "css")
    { 
        var a = window.document.createElement("a");
        a.style.display = 'none';
        
        a.href = window.URL.createObjectURL(new Blob([js_file], {type: "text/html"}));
        
        a.download = css_file.name;
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
    }
    else if(type === "js")
    {
        var a = window.document.createElement("a");
        a.style.display = 'none';
        
        a.href = window.URL.createObjectURL(new Blob([js_file], {type: "text/html"}));
        
        a.download = js_file.name;
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
    }
}