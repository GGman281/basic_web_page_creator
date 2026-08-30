// get and fetch working directory
const importFolder = document.getElementById("folder");
importFolder.addEventListener("change", () =>
    {
        if(importFolder.files)
        {
            fetchFolder()
        }
    });


function fetchFolder()
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
    
    
    
}