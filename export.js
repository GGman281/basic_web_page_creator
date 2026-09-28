function prompt_name()
{
    let name = prompt("Put file name here: ");
    if(name === null || name.length === 0)
    {
        let repeat = confirm("Warning: input field is empty or user cancelled. \nFile name remain the same.");
        while(!repeat && (name === null || name.length === 0))
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

function prompt_file_choice(file_array)
{
    let message = "Please choose file: \n";
    for(let i = 0; i < file_array.length; i++)
    {
        message += i + ") " + file_array[i].name + "\n";
    }
    let choice
    do
    {
        choice = prompt(message);    
    }while(choice < 0 || choice > file_array.length - 1 || isNaN(choice));
    return file_array[choice];
}

function download(type)
{
    
    
    if(type === "html")
    {
        change_html_file_path(js_files, parsed_html.scripts, "src", "webkitRelativePath",  "name");
        change_html_file_path(css_files, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", "webkitRelativePath", "name");
        
        const blob = new Blob(["<!DOCTYPE HTML>\n" + parsed_html.documentElement.outerHTML], {type: "text/html"});
        let html_file;
        if(html_files.length === 0)
        {
            alert("No html file found in folder. Using default template");
        }
        else if(html_files.length == 1)
        {
            html_file = html_files[0];
        }
        else
        {
            html_file = prompt_file_choice(html_files);
        }
        export_file(html_file, blob, ".html");
        
        change_html_file_path(css_files, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", "name", "webkitRelativePath");
        change_html_file_path(js_files, parsed_html.scripts, "src",  "name", "webkitRelativePath");
        
        update_iframe();
    }
    else if(type === "css")
    { 
        let css_file;
        if(css_files.length === 0)
        {
            console.error("Couldn't find css file");
            return;
        }
        if(css_files.length == 1)
        {
            css_file = css_files[0];
        }
        else
        {
            css_file = prompt_file_choice(css_files);
        }
        
        const blob = new Blob([css_file], {type: "text/css"});
        export_file(css_file, blob, ".css");
    }
    else if(type === "js")
    {
        let js_file;
        if(js_files.length === 0)
        {
            console.error("Couldn't find js file");
            return;
        }
        if(js_files.length == 1)
        {
            js_file = js_files[0];
        }
        else
        {
            js_file = prompt_file_choice(js_files);
        }
        
        
        const blob = new Blob([js_file], {type: "text/javascript"});
        export_file(js_file, blob, ".js");
    }
}

//todo: export all files option