import { IwLog, IwLogHvut, IwLogVanilla } from "./iw-log"

function main() {
    setTimeout(() => {
        const isHvutActive = !!document.querySelector("#hvut-top")

        // @ts-ignore
        unsafeWindow.IwLog = isHvutActive ? new IwLogHvut() : new IwLogVanilla()
        // @ts-ignore
        unsafeWindow.IwLog.attachListeners()
    }, 500)
}

main()
