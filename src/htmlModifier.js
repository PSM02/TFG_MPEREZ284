/* 
    This method is used to format an HTML

    in: <!DOCTYPE html> <html lang="es"> <body> <article lang="en"> They wandered into a strange Tiki bar on the edge of the small beach town. </article> </body> </html>
    
    out:
    <!DOCTYPE html> 
        <html lang="es"> 
            <body> 
                <article lang="en"> 
                    They wandered into a strange Tiki bar on the edge of the small beach town. 
                </article> 
            </body> 
        </html>
*/

function formatHTML(html) {
    let formattedHTML = html;
    //split the html by the tag "<" and ">"
    let list = formattedHTML.split(">");
    console.log(list);
    //iterate over the list
    for (let i = 0; i < list.length; i++) {
        //if the element is not empty
        if (list[i].length > 0) {
            //if the element is not a closing tag
            if (list[i].charAt(0) !== "/") {
                //if the element is not an opening tag
                if (list[i].charAt(0) !== "<") {
                    //add a new line
                    list[i] = "\n" + list[i];
                }
                //add the tag
                list[i] = list[i] + ">";
            }
            

        }
    }
    //join the list
    formattedHTML = list.join("");
    return formattedHTML;
}

module.exports = { formatHTML };
