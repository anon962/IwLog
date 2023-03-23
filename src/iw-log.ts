class IwLog {
    private didAttachListeners = false

    attachListeners(): void {
        if (this.didAttachListeners) {
            console.warn("Ignored attempt to reattach IW listeners.")
        }
        this.didAttachListeners = true
        console.log("Attached IwLog listeners.")
    }

    async logReforge(eid: string) {
        const potencies = await this.fetchPotencies(eid)
        this.log(eid, { type: "reforge", potencies })
    }

    async logRun(eid: string) {
        const potencies = await this.fetchPotencies(eid)
        this.log(eid, { type: "run", potencies })
    }

    log(eid: string | number, line: any): void {
        eid = eid.toString()
        //@ts-ignore
        const info = dynjs_equip[eid]

        const ls_key = "hvw_iw_log"
        const log: Record<string, any[]> = JSON.parse(
            localStorage.getItem(ls_key) || "{}"
        )

        log[eid] = log[eid] || [
            {
                type: "init",
                info: {
                    name: info["t"],
                    eid: eid,
                    key: info["k"],
                    date: new Date().toISOString(),
                },
            },
        ]

        line.date = new Date().toISOString()
        log[eid].push(line)

        localStorage.setItem(ls_key, JSON.stringify(log))
    }

    protected async fetchPotencies(eid: string) {
        // Fetch equip page
        //@ts-ignore
        const info = dynjs_equip[eid]
        const eqUrl = `${location.origin}/equip/${eid}/${info["k"]}`
        const resp = await (await fetch(eqUrl)).text()
        const eqDocument = new DOMParser().parseFromString(resp, "text/xml")
        console.log("Found equip", eqUrl, info)

        // Extract potencies
        const els = Array.from(eqDocument.querySelectorAll("#ep > span") || [])
        const result = Object.fromEntries(
            els.map((span) => {
                const match = span.textContent?.match(/(.*) Lv.(\d)/)
                if (!match) {
                    console.error("Invalid potency span", span)
                    throw Error()
                }

                const [_, nameStr, levelStr] = match
                const level = parseInt(levelStr)
                return [nameStr.toLowerCase(), level]
            })
        )
        console.log("Found potencies", result)

        return result
    }
}

class IwLogVanilla extends IwLog {
    attachListeners() {
        super.attachListeners()

        const params = Object.fromEntries(
            window.location.search
                .slice(1)
                .split("&")
                .map((paramStr) => paramStr.split("="))
        )

        const isIwPage = params["ss"] === "iw"
        if (isIwPage) {
            this.attachBattleStartListener()
        }

        const isReforgePage = params["ss"] == "fo"
        if (isReforgePage) {
            this.attachReforgeListener()
        }
    }

    private attachReforgeListener() {
        // Attach listener to reforge button
        const button = document.querySelector("#reforge_button")!
            .parentElement as HTMLDivElement
        button.addEventListener("click", async () => {
            // Check if button is clickable
            const isClickable = !!button.querySelector(
                'img[src="/y/shops/reforge.png"]'
            )
            if (!isClickable) {
                return
            }

            // Find equip we're about to reforge
            const equipEl = document.querySelector(".eqp > div[style]")
            if (!equipEl) {
                console.error(
                    "Reforge button clicked but no equip was selected"
                )
                return
            }
            const eid = equipEl.id.slice(1)

            // Log it
            this.logReforge(eid)
        })
    }

    private attachBattleStartListener() {
        // Attach listener to "Enter Item World" button
        const button = document.querySelector("#accept_button")!
            ?.parentElement as HTMLDivElement

        // Sometimes we're in battle despite what the url says
        if (!button) return

        button.addEventListener("click", async () => {
            // Check if button is clickable
            const isClickable = !!button.querySelector(
                'img[src="/y/shops/enteritemworld.png"]'
            )
            if (!isClickable) {
                return
            }

            // Find equip we're about to reforge
            const equipEl = document.querySelector(".eqp > div[style]")
            if (!equipEl) {
                console.error(
                    "Reforge button clicked but no equip was selected"
                )
                return
            }
            const eid = equipEl.id.slice(1)

            // Log it
            this.logRun(eid)
        })
    }
}

class IwLogHvut extends IwLog {
    listeners: any = {}

    private hvutCheckFreqMs = 250

    attachListeners() {
        super.attachListeners()

        const params = Object.fromEntries(
            window.location.search
                .slice(1)
                .split("&")
                .map((paramStr) => paramStr.split("="))
        )

        const isIwPage = params["ss"] === "iw"
        if (isIwPage) {
            setInterval(() => {
                this.attachReforgeListener()
                this.attachBattleStartListener()
            }, this.hvutCheckFreqMs)
        }
    }

    private attachReforgeListener() {
        const key = "reforge"

        // Find equip we're about to reforge
        const equipEl = document.querySelector(".eqp > div[style]")
        if (!equipEl) {
            delete this.listeners[key]
            return
        }
        const eid = equipEl.id.slice(1)

        // Attach listener to reforge button
        const reforgeButton =
            equipEl.parentElement?.querySelector(".hvut-iw-reforge")
        if (reforgeButton) {
            if (this.listeners[key]) {
                reforgeButton.removeEventListener("click", this.listeners[key])
            }

            const reforgeListener = async () => {
                const potencies = await this.fetchPotencies(eid)
                this.log(eid, { type: "reforge", potencies })
            }
            reforgeButton.addEventListener("click", reforgeListener)
            this.listeners[key] = reforgeListener
        }
    }

    private attachBattleStartListener() {
        // Attach listener to "Enter Item World" button
        const battleStartButton = document.querySelector(
            "#accept_button"
        ) as HTMLButtonElement
        const battleStartListener = async () => {
            const eid = document.querySelector(".eqp > div[style]")!.id.slice(1)

            // @ts-ignore
            const isButtonActive = battleStartButton.src.includes(
                "/y/shops/enteritemworld.png"
            )
            if (!isButtonActive || !eid) {
                console.error(
                    "'Enter Item World' button has listener but no equip selected"
                )
                return
            }

            const potencies = await this.fetchPotencies(eid)
            this.log(eid, { type: "run", potencies })
        }

        if (this.listeners["battleStart"]) {
            battleStartButton.removeEventListener(
                "click",
                this.listeners["battleStart"]
            )
        }
        battleStartButton.addEventListener("click", battleStartListener)
        this.listeners["battleStart"] = battleStartListener
    }
}

setTimeout(() => {
    const isHvutActive = !!document.querySelector("#hvut-top")

    // @ts-ignore
    unsafeWindow.IwLog = isHvutActive ? new IwLogHvut() : new IwLogVanilla()
    // @ts-ignore
    unsafeWindow.IwLog.attachListeners()
}, 500)
