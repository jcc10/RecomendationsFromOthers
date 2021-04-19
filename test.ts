import {AO3} from "./ao3.ts";

const debug = await AO3("Jcc10", 500);

for(const user of debug.keys()){
    console.log(`${user}: ${debug.get(user)}`);
}