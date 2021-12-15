import axios from "axios";
import { Command } from "commander";
import { loadConfig } from "./util";
import { HttpsProxyAgent } from "https-proxy-agent";
import { serve } from "./serve";
function main(){
    const program = new Command()
    program.option(
        "-f, --file <file>"
    )
    program.command('serve')
        .action(async ()=>{
            try {
                let {file} = program.opts()
            if (!file || file.length === 0) {
                file = './etc/config.js'
            }
            let config = await loadConfig<any>(file);
            await serve(config)
            } catch (error) {
                console.error(error)
				process.exit(1)
            }
        })
    program.parse(process.argv)
}
main()