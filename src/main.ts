import { IwLog, IwLogHvut, IwLogVanilla } from "./iw-log"
import { showPrintMenu } from "./print-menu"

function main() {
    // Attach reforge / battle-start listeners
    setTimeout(() => {
        const isHvutActive = !!document.querySelector("#hvut-top")

        // @ts-ignore
        unsafeWindow.IwLog = isHvutActive ? new IwLogHvut() : new IwLogVanilla()
        // @ts-ignore
        unsafeWindow.IwLog.attachListeners()
    }, 500)

    // @ts-ignore
    // Create extension menu items
    GM_registerMenuCommand("Print logs", showPrintMenu)
}

main()
