import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

function userToURL(user: string, page:number | string): string {
    return `https://archiveofourown.org/users/${user}/bookmarks?bookmark_search%5Bbookmark_query%5D=&bookmark_search%5Bbookmarkable_query%5D=&bookmark_search%5Bexcluded_bookmark_tag_names%5D=&bookmark_search%5Bexcluded_tag_names%5D=&bookmark_search%5Blanguage_id%5D=&bookmark_search%5Bother_bookmark_tag_names%5D=&bookmark_search%5Bother_tag_names%5D=&bookmark_search%5Brec%5D=1&bookmark_search%5Bsort_column%5D=created_at&bookmark_search%5Bwith_notes%5D=0&commit=Sort+and+Filter&page=${page}&utf8=%E2%9C%93`
}

export async function AO3(user: string){
    const bookmarks = await retrieveUserBookmarks(user);
    return bookmarks;
}

async function retrieveUserBookmarks(user: string): Promise<Array<string>> {
    const bookmarks = new Array<string>();
    let i = 1;
    let max = 1;
    let found = 0;
    while(i <= max){
        console.log(`Working on ${i} of ${max}... (${(i-1) * 20} - ${i * 20} / ${max * 20})`)
        const bookmarksDoc = new DOMParser().parseFromString(
            await fetch(userToURL(user, i)).then(resp=>resp.text()),
            "text/html"
        );
        if(!bookmarksDoc){
            throw new Error("Unable to get the primary user's bookmark list.");
        }
        for(const bookNode of bookmarksDoc.querySelectorAll("dd.bookmarks a")){
            const bookElement = bookNode as Element;
            bookmarks.push(bookElement.attributes.getNamedItem("href").value)
            found += 1;
        }
        for(const external of bookmarksDoc.querySelectorAll("span.external-work")){
            found += 1;
        }
        {
            const maxStr = bookmarksDoc.querySelector("li.next")?.previousElementSibling?.textContent;
            if(maxStr)
                max = parseInt(maxStr);
        }
        i++
    }
    console.log(`Found ${found} books out of around ${(max - 1) * 20} - ${max * 20} books. ${found - bookmarks.length} were external and won't be processed currently.`);
    return bookmarks;
}